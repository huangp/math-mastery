# -*- coding: utf-8 -*-
"""把 qgen_*.js 里尚未国际化的中文串包进 G(key, vars, 原文)。

  用法：python3 tools/i18n_wrap.py js/qgen_high.js [键前缀infix]

设计要点：
- 已经包在 G(...) 里的内容整体跳过，不会二次包裹（合并上游后最关键的一条）。
- 键形如 gen.<技巧id>.<infix><序号><q|e>；infix 默认 "u"，与历史键不冲突。
- 模板里的 ${...} 按出现顺序记作 v1, v2 …，英文模板可自由调整语序。
- 输出待翻译清单（键 + 中文原文）到 <文件名>.entries.json，供人工/批量填英文。
"""
import io, json, re, sys

CJK = re.compile(r'[一-鿿？，。、：；（）「」“”·…]')

def find_template(s, i):
    """s[i] == '`'，返回 (原文, 结束下标+1)"""
    j, depth = i + 1, 0
    while j < len(s):
        c = s[j]
        if c == '\\': j += 2; continue
        if c == '`' and depth == 0: return s[i:j+1], j + 1
        if c == '$' and j + 1 < len(s) and s[j+1] == '{': depth += 1; j += 2; continue
        if depth:
            if c == '{': depth += 1
            elif c == '}': depth -= 1
        j += 1
    raise ValueError("未闭合的模板字符串")

def find_dq(s, i):
    j = i + 1
    while j < len(s):
        if s[j] == '\\': j += 2; continue
        if s[j] == '"': return s[i:j+1], j + 1
        j += 1
    raise ValueError("未闭合的字符串")

def skip_call(s, i):
    """i 指向 'G(' 的 G，返回整个平衡括号调用的结束下标"""
    j = s.index('(', i) + 1; depth = 1
    while j < len(s) and depth:
        c = s[j]
        if c == '`': _, j = find_template(s, j); continue
        if c == '"': _, j = find_dq(s, j); continue
        if c == '(': depth += 1
        elif c == ')': depth -= 1
        j += 1
    return j

def split_parts(lit):
    body = lit[1:-1]; parts, exprs, buf, i = [], [], "", 0
    while i < len(body):
        if body[i] == '\\': buf += body[i:i+2]; i += 2; continue
        if body[i] == '$' and i + 1 < len(body) and body[i+1] == '{':
            depth, j = 1, i + 2; start = j
            while j < len(body) and depth:
                if body[j] == '{': depth += 1
                elif body[j] == '}': depth -= 1
                j += 1
            parts.append(buf); buf = ""; exprs.append(body[start:j-1]); i = j; continue
        buf += body[i]; i += 1
    parts.append(buf)
    return parts, exprs

def split_args(s, i):
    """i 指向 'Q(' 的 Q；返回 (参数区起点, [(起,止)...], 调用结束下标)"""
    j = s.index('(', i) + 1; start = j; depth = 1; args = []; seg = j
    while j < len(s) and depth:
        c = s[j]
        if c == '`': _, j = find_template(s, j); continue
        if c == '"': _, j = find_dq(s, j); continue
        if c in '([{': depth += 1
        elif c in ')]}':
            depth -= 1
            if depth == 0: args.append((seg, j)); j += 1; break
        elif c == ',' and depth == 1:
            args.append((seg, j)); seg = j + 1
        j += 1
    return start, args, j


def main(path, infix="u"):
    src = io.open(path, encoding="utf-8").read()
    m = re.search(r'const GEN = \{([\s\S]*?)\};', src)
    fn2id = {v: k for k, v in re.findall(r'(\w+)\s*:\s*(\w+)', m.group(1))} if m else {}
    fns = [(mm.start(), mm.group(1)) for mm in re.finditer(r'\n  function (q\w+)\s*\(', src)]
    fns.append((len(src), None))

    entries, out, pos, counters = [], [], 0, {}

    def wrap(lit, prefix, kind):
        n = counters.get((prefix, kind), 0); counters[(prefix, kind)] = n + 1
        key = "%s.%s%s%d" % (prefix, infix, kind, n)
        if lit[0] == '`':
            parts, exprs = split_parts(lit)
            vmap = {"v%d" % (k + 1): e for k, e in enumerate(exprs)}
            vjs = "{ " + ", ".join("%s: %s" % (a, b) for a, b in vmap.items()) + " }" if vmap else "null"
            zh = "".join(p + ("{v%d}" % (k + 1) if k < len(exprs) else "") for k, p in enumerate(parts))
        else:
            vjs, zh = "null", lit[1:-1]
        entries.append({"key": key, "zh": zh})
        return 'G("%s", %s, %s)' % (key, vjs, lit)

    for idx in range(len(fns) - 1):
        start, name = fns[idx]; end = fns[idx + 1][0]
        prefix = "gen." + fn2id.get(name, name)
        out.append(src[pos:start])
        seg = src[start:end]; buf = []; i = 0
        while i < len(seg):
            # 已包好的 G(...) 整体跳过
            g = re.compile(r'\bG\(').search(seg, i)
            mq = re.compile(r'\b(q|exp)\s*=\s*(?=[`"])').search(seg, i)
            mo = re.compile(r'\bopts\(').search(seg, i)
            mp = re.compile(r'Q\(q, o, [^,]+, exp, ("(?:[^"\\]|\\.)*")').search(seg, i)
            mQ = re.compile(r'\bQ\(\s*(?=[`"])').search(seg, i)   # 位置参数写法
            cands = [(x.start(), tag) for x, tag in ((g, 'g'), (mq, 'q'), (mo, 'o'), (mp, 'p'), (mQ, 'Q')) if x]
            if not cands: buf.append(seg[i:]); break
            nxt, tag = min(cands)
            buf.append(seg[i:nxt])
            if tag == 'g':
                j = skip_call(seg, nxt); buf.append(seg[nxt:j]); i = j; continue
            if tag == 'q':
                j = mq.end()
                lit, j2 = (find_template(seg, j) if seg[j] == '`' else find_dq(seg, j))
                buf.append(seg[nxt:j])
                buf.append(wrap(lit, prefix, "q" if mq.group(1) == "q" else "e") if CJK.search(lit) else lit)
                i = j2; continue
            if tag == 'p':
                lit = mp.group(1); buf.append(seg[nxt:mp.start(1)])
                buf.append(wrap(lit, prefix, "pt") if CJK.search(lit) else lit)
                i = mp.end(1); continue
            if tag == 'Q':
                _, args, endj = split_args(seg, nxt)
                buf.append(seg[nxt:args[0][0]])
                pieces = []
                for ai, (a0, a1) in enumerate(args):
                    txt = seg[a0:a1]; t = txt.strip()
                    if ai in (0, 3, 4) and t[:1] in '`"' and CJK.search(t):
                        kind = {0: 'q', 3: 'e', 4: 'pt'}[ai]
                        pieces.append(txt.replace(t, wrap(t, prefix, kind), 1))
                    elif t.startswith('opts('):
                        sub = []; k = 0
                        while k < len(txt):
                            c = txt[k]
                            if c == 'G' and txt[k:k+2] == 'G(':
                                k2 = skip_call(txt, k); sub.append(txt[k:k2]); k = k2; continue
                            if c in '`"':
                                lit, k2 = (find_template(txt, k) if c == '`' else find_dq(txt, k))
                                sub.append(wrap(lit, prefix, 'o') if CJK.search(lit) else lit); k = k2; continue
                            sub.append(c); k += 1
                        pieces.append("".join(sub))
                    else:
                        pieces.append(txt)
                buf.append(",".join(pieces)); buf.append(")")
                i = endj; continue
            # opts(...)：逐个包住带中文的字面量，内部的 G(...) 跳过
            j = mo.end(); depth = 1; buf.append(seg[nxt:mo.end()])
            while j < len(seg) and depth:
                c = seg[j]
                if c == 'G' and seg[j:j+2] == 'G(':
                    j2 = skip_call(seg, j); buf.append(seg[j:j2]); j = j2; continue
                if c in '`"':
                    lit, j2 = (find_template(seg, j) if c == '`' else find_dq(seg, j))
                    buf.append(wrap(lit, prefix, "o") if CJK.search(lit) else lit)
                    j = j2; continue
                if c == '(': depth += 1
                elif c == ')':
                    depth -= 1
                    if depth == 0: buf.append(c); j += 1; break
                buf.append(c); j += 1
            i = j
        out.append("".join(buf)); pos = end
    out.append(src[pos:])
    io.open(path, "w", encoding="utf-8").write("".join(out))
    json.dump(entries, io.open(path + ".entries.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print("%s：新包裹 %d 条，清单写入 %s.entries.json" % (path, len(entries), path))

if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else "u")
