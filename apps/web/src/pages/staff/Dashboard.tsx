export default function StaffDashboard() {
  return (
    <>
      <p className="pen text-2xl">examiner queue</p>
      <h1 className="mb-8">Scripts awaiting review</h1>
      <table className="w-full text-sm bg-paper-warm border border-ink/10 rounded-md overflow-hidden">
        <thead className="bg-blue-wash text-ink">
          <tr>
            <th className="text-left p-3">Script</th>
            <th className="text-left p-3">Subject</th>
            <th className="text-left p-3">Provisional</th>
            <th className="text-left p-3">Age</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['#RP-8821', 'Physics', '68 / 100', '4h'],
            ['#RP-8822', 'Maths', '71 / 100', '6h'],
            ['#RP-8823', 'Chemistry', '55 / 100', '11h'],
          ].map(([id, subj, prov, age]) => (
            <tr key={id} className="border-t border-ink/10">
              <td className="p-3 font-mono">{id}</td>
              <td className="p-3">{subj}</td>
              <td className="p-3">{prov}</td>
              <td className="p-3">{age}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
