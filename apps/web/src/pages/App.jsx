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
  const [token, setToken] = useState(() => localStorage.getItem('accessToken') || '');
  const [error, setError] = useState('');
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [payroll, setPayroll] = useState([]);

  const [employeeForm, setEmployeeForm] = useState(emptyEmployee);
  const [checkInForm, setCheckInForm] = useState({ employee_code: '', source: 'remote', geofence_label: 'HQ' });
  const [leaveForm, setLeaveForm] = useState({ employee_code: '', start_date: '', end_date: '', reason: '' });
  const [payrollForm, setPayrollForm] = useState({ employee_code: '', period_label: '', gross_pay: '', deductions: '' });

  const employeeCodes = useMemo(() => employees.map((e) => e.employee_code), [employees]);
  const pendingCheckouts = useMemo(() => attendance.filter((a) => !a.check_out_at).length, [attendance]);
  const pendingLeaves = useMemo(() => leaves.filter((l) => l.status === 'PENDING').length, [leaves]);
  const monthlyPayout = useMemo(
    () => payroll.reduce((sum, p) => sum + Number(p.net_pay || 0), 0).toFixed(2),
    [payroll]
  );

  async function login() {
    try {
      const data = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'admin@shreshlabs.com', password: 'Admin@12345' })
      });
      localStorage.setItem('accessToken', data.accessToken);
      setToken(data.accessToken);
      setError('');
    } catch (e) {
      setError(e.message);
    }
  }

  async function fetchData(currentToken) {
    if (!currentToken) return;
    try {
      const [emp, att, lv, pr] = await Promise.all([
        api('/employees', {}, currentToken),
        api('/attendance', {}, currentToken),
        api('/leaves', {}, currentToken),
        api('/payroll', {}, currentToken)
      ]);
      setEmployees(emp);
      setAttendance(att);
      setLeaves(lv);
      setPayroll(pr);
      setError('');
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    fetchData(token);
  }, [token]);

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

  async function checkIn(e) {
    e.preventDefault();
    try {
      await api(
        '/attendance/check-in',
        {
          method: 'POST',
          body: JSON.stringify({ ...checkInForm, check_in_at: new Date().toISOString() })
        },
        token
      );
      fetchData(token);
    } catch (err) {
      setError(err.message);
    }
  }

  async function checkOut(attendanceId) {
    try {
      await api(
        '/attendance/check-out',
        {
          method: 'POST',
          body: JSON.stringify({ attendance_id: attendanceId, check_out_at: new Date().toISOString() })
        },
        token
      );
      fetchData(token);
    } catch (err) {
      setError(err.message);
    }
  }

  async function createLeave(e) {
    e.preventDefault();
    try {
      await api('/leaves', { method: 'POST', body: JSON.stringify(leaveForm) }, token);
      setLeaveForm({ employee_code: '', start_date: '', end_date: '', reason: '' });
      fetchData(token);
    } catch (err) {
      setError(err.message);
    }
  }

  async function approveLeave(id) {
    try {
      await api(`/leaves/${id}/approve`, { method: 'PATCH' }, token);
      fetchData(token);
    } catch (err) {
      setError(err.message);
    }
  }

  async function createPayroll(e) {
    e.preventDefault();
    try {
      await api(
        '/payroll',
        {
          method: 'POST',
          body: JSON.stringify({
            ...payrollForm,
            gross_pay: Number(payrollForm.gross_pay),
            deductions: Number(payrollForm.deductions || 0)
          })
        },
        token
      );
      setPayrollForm({ employee_code: '', period_label: '', gross_pay: '', deductions: '' });
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
          <p className="mt-2 text-slate-300">Actual data-backed HRMS: employees, attendance, leave and payroll persisted in PostgreSQL.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button onClick={login} className="rounded-lg bg-cyan-400 px-4 py-2 font-semibold text-slate-900">Login as Admin</button>
            <a className="rounded-lg border border-slate-700 px-4 py-2" href="http://localhost:8080/api-docs" target="_blank" rel="noreferrer">Open API Docs</a>
          </div>
          {error && <p className="mt-3 text-sm text-rose-400">{error}</p>}
        </header>

        <section className="mt-6 grid gap-4 sm:grid-cols-4">
          <StatCard label="Employees" value={employees.length} />
          <StatCard label="Open Attendance" value={pendingCheckouts} />
          <StatCard label="Pending Leaves" value={pendingLeaves} />
          <StatCard label="Net Payroll" value={`$${monthlyPayout}`} />
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
            <ul className="mt-4 max-h-56 space-y-2 overflow-auto text-sm">
              {employees.map((e) => (
                <li key={e.id} className="rounded-lg border border-slate-800 bg-slate-950 p-2">
                  <span className="font-semibold text-cyan-300">{e.employee_code}</span> · {e.full_name} · {e.department}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <h2 className="text-xl font-semibold">Attendance</h2>
            <form className="mt-4 grid gap-3" onSubmit={checkIn}>
              <select className="rounded-lg border border-slate-700 bg-slate-950 p-2" value={checkInForm.employee_code} onChange={(e) => setCheckInForm({ ...checkInForm, employee_code: e.target.value })} required>
                <option value="">Select Employee Code</option>
                {employeeCodes.map((code) => (
                  <option key={code} value={code}>{code}</option>
                ))}
              </select>
              <select className="rounded-lg border border-slate-700 bg-slate-950 p-2" value={checkInForm.source} onChange={(e) => setCheckInForm({ ...checkInForm, source: e.target.value })}>
                <option value="remote">Remote</option>
                <option value="manual">Manual</option>
                <option value="biometric">Biometric</option>
              </select>
              <input className="rounded-lg border border-slate-700 bg-slate-950 p-2" placeholder="Geofence Label" value={checkInForm.geofence_label} onChange={(e) => setCheckInForm({ ...checkInForm, geofence_label: e.target.value })} />
              <button className="rounded-lg bg-cyan-400 px-4 py-2 font-semibold text-slate-900">Check In</button>
            </form>
            <ul className="mt-4 max-h-56 space-y-2 overflow-auto text-sm">
              {attendance.map((a) => (
                <li key={a.id} className="rounded-lg border border-slate-800 bg-slate-950 p-2">
                  {a.employee_id.slice(0, 8)}... · {a.source}
                  {!a.check_out_at && (
                    <button onClick={() => checkOut(a.id)} className="ml-3 rounded bg-amber-400 px-2 py-1 text-xs font-semibold text-slate-900">
                      Check Out
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <h2 className="text-xl font-semibold">Leave Management</h2>
            <form className="mt-4 grid gap-3" onSubmit={createLeave}>
              <select className="rounded-lg border border-slate-700 bg-slate-950 p-2" value={leaveForm.employee_code} onChange={(e) => setLeaveForm({ ...leaveForm, employee_code: e.target.value })} required>
                <option value="">Select Employee Code</option>
                {employeeCodes.map((code) => (
                  <option key={code} value={code}>{code}</option>
                ))}
              </select>
              <input className="rounded-lg border border-slate-700 bg-slate-950 p-2" type="date" value={leaveForm.start_date} onChange={(e) => setLeaveForm({ ...leaveForm, start_date: e.target.value })} required />
              <input className="rounded-lg border border-slate-700 bg-slate-950 p-2" type="date" value={leaveForm.end_date} onChange={(e) => setLeaveForm({ ...leaveForm, end_date: e.target.value })} required />
              <input className="rounded-lg border border-slate-700 bg-slate-950 p-2" placeholder="Reason" value={leaveForm.reason} onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })} required />
              <button className="rounded-lg bg-cyan-400 px-4 py-2 font-semibold text-slate-900">Create Leave Request</button>
            </form>
            <ul className="mt-4 max-h-56 space-y-2 overflow-auto text-sm">
              {leaves.map((l) => (
                <li key={l.id} className="rounded-lg border border-slate-800 bg-slate-950 p-2">
                  {l.employee_code} · {l.start_date} to {l.end_date} · {l.status}
                  {l.status === 'PENDING' && (
                    <button onClick={() => approveLeave(l.id)} className="ml-3 rounded bg-emerald-400 px-2 py-1 text-xs font-semibold text-slate-900">
                      Approve
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <h2 className="text-xl font-semibold">Payroll</h2>
            <form className="mt-4 grid gap-3" onSubmit={createPayroll}>
              <select className="rounded-lg border border-slate-700 bg-slate-950 p-2" value={payrollForm.employee_code} onChange={(e) => setPayrollForm({ ...payrollForm, employee_code: e.target.value })} required>
                <option value="">Select Employee Code</option>
                {employeeCodes.map((code) => (
                  <option key={code} value={code}>{code}</option>
                ))}
              </select>
              <input className="rounded-lg border border-slate-700 bg-slate-950 p-2" placeholder="Period (e.g. 2026-02)" value={payrollForm.period_label} onChange={(e) => setPayrollForm({ ...payrollForm, period_label: e.target.value })} required />
              <input className="rounded-lg border border-slate-700 bg-slate-950 p-2" type="number" placeholder="Gross Pay" value={payrollForm.gross_pay} onChange={(e) => setPayrollForm({ ...payrollForm, gross_pay: e.target.value })} required />
              <input className="rounded-lg border border-slate-700 bg-slate-950 p-2" type="number" placeholder="Deductions" value={payrollForm.deductions} onChange={(e) => setPayrollForm({ ...payrollForm, deductions: e.target.value })} />
              <button className="rounded-lg bg-cyan-400 px-4 py-2 font-semibold text-slate-900">Generate Payslip</button>
            </form>
            <ul className="mt-4 max-h-56 space-y-2 overflow-auto text-sm">
              {payroll.map((p) => (
                <li key={p.id} className="rounded-lg border border-slate-800 bg-slate-950 p-2">
                  {p.employee_code} · {p.period_label} · Net ${p.net_pay}
                </li>
              ))}
            </ul>
          </section>
        </main>
      </div>
    </div>
  );
}
