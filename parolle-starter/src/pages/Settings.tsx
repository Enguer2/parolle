
export default function Settings() {
  return (
    <section className="max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-2">Réglages</h1>
      <ul className="text-sm space-y-2">
        <li><label className="flex items-center gap-2"><input type="checkbox" /> Mode daltonien</label></li>
        <li><label className="flex items-center gap-2"><input type="checkbox" /> Mode sombre</label></li>
        <li><label className="flex items-center gap-2"><input type="checkbox" /> Sons</label></li>
      </ul>
    </section>
  )
}
