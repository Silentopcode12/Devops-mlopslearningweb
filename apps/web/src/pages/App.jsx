import { useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';
import StatCard from '../components/StatCard';

const emptyEmployee = {
  employee_code: '',
  full_name: '',
  email: '',
  department: '',
  job_title: '',
  employment_type: 'Full-time',
  joining_date: ''
};

export default function App() {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [employeeForm, setEmployeeForm] = useState(emptyEmployee);
  const [checkIn, setCheckIn] = useState({ employee_id: '', source: 'remote', geofence_label: 'HQ' });

  async function login() {
    try {
      const data = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'admin@shreshlabs.com', password: 'Admin@12345' })
      });
      setToken(data.accessToken);
      setError('');
    } catch (e) {
      setError(e.message);
    }
  }

  async function fetchData(currentToken) {
    if (!currentToken) return;
    try {
      const [emp, att] = await Promise.all([
        api('/employees', {}, currentToken),
        api('/attendance', {}, currentToken)
      ]);
      setEmployees(emp);
      setAttendance(att);
      setError('');
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    fetchData(token);
  }, [token]);

  const pendingCheckouts = useMemo(() => attendance.filter((a) => !a.check_out_at).length, [attendance]);

  async function submitEmployee(e) {
    e.preventDefault();
    try {
      await api('/employees', { method: 'POST', body: JSON.stringify(employeeForm) }, token);
      setEmployeeForm(emptyEmployee);
      fetchData(token);
    } catch (err) {
      setError(err.message);
    }
  }

  async function submitCheckIn(e) {
    e.preventDefault();
    try {
      await api(
        '/attendance/check-in',
        {
          method: 'POST',
          body: JSON.stringify({ ...checkIn, check_in_at: new Date().toISOString() })
        },
        token
      );
      fetchData(token);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto w-full max-w-7xl p-6">
        <header className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 to-slate-800 p-6">
          <h1 className="text-3xl font-bold">Nimbus HRMS</h1>
          <p className="mt-2 text-slate-300">Multi-tenant HRMS SaaS starter with secure API-first architecture.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button onClick={login} className="rounded-lg bg-cyan-400 px-4 py-2 font-semibold text-slate-900">Quick Admin Login</button>
            <a className="rounded-lg border border-slate-700 px-4 py-2" href="http://localhost:8080/api-docs" target="_blank">Open API Docs</a>
          </div>
          {error && <p className="mt-3 text-sm text-rose-400">{error}</p>}
        </header>

        <section className="mt-6 grid gap-4 sm:grid-cols-3">
          <StatCard label="Employees" value={employees.length} />
          <StatCard label="Attendance Logs" value={attendance.length} />
          <StatCard label="Pending Check-outs" value={pendingCheckouts} />
        </section>

        <main className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <h2 className="text-xl font-semibold">Employee Management</h2>
            <form className="mt-4 grid gap-3" onSubmit={submitEmployee}>
              <input className="rounded-lg border border-slate-700 bg-slate-950 p-2" placeholder="Employee Code" value={employeeForm.employee_code} onChange={(e) => setEmployeeForm({ ...employeeForm, employee_code: e.target.value })} required />
              <input className="rounded-lg border border-slate-700 bg-slate-950 p-2" placeholder="Full Name" value={employeeForm.full_name} onChange={(e) => setEmployeeForm({ ...employeeForm, full_name: e.target.value })} required />
              <input className="rounded-lg border border-slate-700 bg-slate-950 p-2" placeholder="Email" value={employeeForm.email} onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })} required />
              <input className="rounded-lg border border-slate-700 bg-slate-950 p-2" placeholder="Department" value={employeeForm.department} onChange={(e) => setEmployeeForm({ ...employeeForm, department: e.target.value })} required />
              <input className="rounded-lg border border-slate-700 bg-slate-950 p-2" placeholder="Job Title" value={employeeForm.job_title} onChange={(e) => setEmployeeForm({ ...employeeForm, job_title: e.target.value })} required />
              <input className="rounded-lg border border-slate-700 bg-slate-950 p-2" type="date" value={employeeForm.joining_date} onChange={(e) => setEmployeeForm({ ...employeeForm, joining_date: e.target.value })} required />
              <button className="rounded-lg bg-cyan-400 px-4 py-2 font-semibold text-slate-900">Create Employee</button>
            </form>
            <ul className="mt-4 space-y-2 text-sm">
              {employees.map((e) => (
                <li key={e.id} className="rounded-lg border border-slate-800 bg-slate-950 p-2">
                  <span className="font-semibold text-cyan-300">{e.employee_code}</span> · {e.full_name} · {e.department}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <h2 className="text-xl font-semibold">Attendance Tracking</h2>
            <form className="mt-4 grid gap-3" onSubmit={submitCheckIn}>
              <input className="rounded-lg border border-slate-700 bg-slate-950 p-2" placeholder="Employee UUID" value={checkIn.employee_id} onChange={(e) => setCheckIn({ ...checkIn, employee_id: e.target.value })} required />
              <select className="rounded-lg border border-slate-700 bg-slate-950 p-2" value={checkIn.source} onChange={(e) => setCheckIn({ ...checkIn, source: e.target.value })}>
                <option value="remote">Remote</option>
                <option value="manual">Manual</option>
                <option value="biometric">Biometric</option>
              </select>
              <input className="rounded-lg border border-slate-700 bg-slate-950 p-2" placeholder="Geofence Label" value={checkIn.geofence_label} onChange={(e) => setCheckIn({ ...checkIn, geofence_label: e.target.value })} />
              <button className="rounded-lg bg-cyan-400 px-4 py-2 font-semibold text-slate-900">Check In</button>
            </form>
            <ul className="mt-4 space-y-2 text-sm">
              {attendance.map((a) => (
                <li key={a.id} className="rounded-lg border border-slate-800 bg-slate-950 p-2">
                  <span className="text-cyan-300">{a.employee_id}</span> · {a.source} · {a.check_in_at}
                </li>
              ))}
            </ul>
          </section>
        </main>
      </div>
    </div>
  );
}
