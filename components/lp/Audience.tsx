const items = [
  {
    title: "現場で判断・管理を担ってきた",
    body: "飲食店長・施工管理・介護リーダーなど、日々の判断や人・数字の管理を任されてきた方。",
  },
  {
    title: "同じ業界で働き続けたい",
    body: "業界を離れるのではなく、培った知識を活かして同じ業界の別の職種へ進みたい方。",
  },
  {
    title: "書類が通らなかった経験がある",
    body: "事務職・IT職の応募で、経験が伝わらず書類選考を通過できなかった経験のある方。",
  },
];

export default function Audience() {
  return (
    <section className="bg-base">
      <div className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
        <h2 className="text-center text-2xl font-bold sm:text-3xl">
          こんな方へ
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {items.map((item, i) => (
            <div
              key={item.title}
              className="rounded-2xl bg-white p-6 shadow-sm"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-teal text-lg font-bold text-white">
                {i + 1}
              </div>
              <h3 className="text-lg font-bold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-navy/70">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
