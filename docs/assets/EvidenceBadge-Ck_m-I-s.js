import{d as c,j as e,bb as g,F as r}from"./index-BgTG4m-E.js";import{M as d,W as u,L as f}from"./StepCards-BYRGBHKJ.js";/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const o={name:"activity",size:24,node:[["path",{d:"M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2",key:"169zse"}]]};o.node;const k=c(o);/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const x={name:"briefcase",size:24,node:[["path",{d:"M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16",key:"jecpp"}],["rect",{width:"20",height:"14",x:"2",y:"6",rx:"2",key:"i6l2r4"}]]};x.node;const _=c(x);/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const m={name:"message-circle",size:24,node:[["path",{d:"M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719",key:"1sd12s"}]]};m.node;const M=c(m);/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const h={name:"trending-up",size:24,node:[["path",{d:"M16 7h6v6",key:"box55l"}],["path",{d:"m22 7-8.5 8.5-5-5L2 17",key:"1t1m79"}]]};h.node;const w=c(h);function D({text:n,spot:a,icon:s,children:t,moreLabel:i}){return e.jsxs("div",{"data-visual":"keypoint",className:"rounded-2xl border border-line bg-surface p-4 sm:p-5",children:[e.jsxs("div",{className:"flex items-center gap-4",children:[a&&e.jsx("div",{className:"w-24 shrink-0 sm:w-36",children:a}),!a&&s&&e.jsx("span",{className:"flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-soft text-accent",children:e.jsx(s,{className:"h-5 w-5","aria-hidden":!0})}),e.jsx("p",{className:n.length<=30?"font-serif text-lg font-bold leading-snug sm:text-xl":"text-[0.95rem] font-medium leading-relaxed sm:text-base",children:n})]}),t&&e.jsx(d,{label:i,children:t})]})}const j={research:{label:"研究支持",icon:r,cls:"bg-soft text-accent"},preliminary:{label:"初步證據",icon:r,cls:"bg-amber/15 text-amber"},inference:{label:"延伸推論",icon:f,cls:"bg-amber/15 text-amber"},philosophy:{label:"管理哲學",icon:g,cls:"bg-soft text-accent"},tool:{label:"本站工具",icon:u,cls:"bg-apricot/40 text-ink"}};function y({kind:n,label:a}){const s=j[n];return e.jsxs("span",{className:`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${s.cls}`,children:[e.jsx(s.icon,{className:"h-3.5 w-3.5","aria-hidden":!0}),a??s.label]})}function z({kind:n,label:a,summary:s,meta:t=[],children:i,moreLabel:b="看完整說明與研究來源"}){return e.jsxs("div",{"data-visual":"evidence",className:"rounded-2xl border border-line bg-surface p-4",children:[e.jsx(y,{kind:n,label:a}),s&&e.jsx("p",{className:"mt-2 text-sm leading-relaxed",children:s}),t.length>0&&e.jsx("dl",{className:"mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm",children:t.map(([l,p])=>e.jsxs("div",{className:"contents",children:[e.jsx("dt",{className:"text-muted",children:l}),e.jsx("dd",{children:p})]},l))}),i&&e.jsx(d,{label:b,children:i})]})}export{k as A,_ as B,z as E,D as K,M,w as T};
