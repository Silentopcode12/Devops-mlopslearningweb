import { useEffect, useMemo, useState } from 'react';

const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const emptyEmployee = { employeeId: '', name: '', department: '', title: '', salary: '' };
const emptyLeave = { employeeId: '', reason: '', fromDate: '', toDate: '' };
const emptyPayroll = { employeeId: '', month: '', baseSalary: '', bonus: '', deductions: '' };

export default function App() {
  const [employees, setEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [payroll, setPayroll] = useState([]);

  const [employeeForm, setEmployeeForm] = useState(emptyEmployee);
  const [leaveForm, setLeaveForm] = useState(emptyLeave);
  const [payrollForm, setPayrollForm] = useState(emptyPayroll);

  const totalHeadcount = employees.length;
  const approvedLeaves = useMemo(() => leaves.filter((item) => item.status === 'APPROVED').length, [leaves]);
  const totalPayroll = useMemo(
    () => payroll.reduce((sum, item) => sum + Number(item.netPay || 0), 0).toFixed(2),
    [payroll]
  );

  const fetchAll = async () => {
    const [e, l, p] = await Promise.all([
      fetch(`${apiBase}/api/employees`).then((r) => r.json()).catch(() => []),
      fetch(`${apiBase}/api/leave`).then((r) => r.json()).catch(() => []),
      fetch(`${apiBase}/api/payroll`).then((r) => r.json()).catch(() => [])
    ]);
    setEmployees(Array.isArray(e) ? e : []);
    setLeaves(Array.isArray(l) ? l : []);
    setPayroll(Array.isArray(p) ? p : []);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const postJson = (url, payload) =>
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

  const createEmployee = async (event) => {
    event.preventDefault();
    await postJson(`${apiBase}/api/employees`, { ...employeeForm, salary: Number(employeeForm.salary) });
    setEmployeeForm(emptyEmployee);
    fetchAll();
  };

  const createLeave = async (event) => {
    event.preventDefault();
    await postJson(`${apiBase}/api/leave`, leaveForm);
    setLeaveForm(emptyLeave);
    fetchAll();
  };

  const createPayroll = async (event) => {
    event.preventDefault();
    await postJson(`${apiBase}/api/payroll`, {
      ...payrollForm,
      baseSalary: Number(payrollForm.baseSalary),
      bonus: Number(payrollForm.bonus || 0),
      deductions: Number(payrollForm.deductions || 0)
    });
    setPayrollForm(emptyPayroll);
    fetchAll();
  };

  const approveLeave = async (id) => {
    await fetch(`${apiBase}/api/leave/${id}/approve`, { method: 'PATCH' });
    fetchAll();
  };

  return (
    <div className="app">
      <header className="hero">
        <h1>HRMS Control Center</h1>
        <p>Microservice-based HR platform for employee lifecycle, leave workflows, and payroll operations.</p>
      </header>

      <section className="stats">
        <article>
          <h3>{totalHeadcount}</h3>
          <p>Total Employees</p>
        </article>
        <article>
          <h3>{approvedLeaves}</h3>
          <p>Approved Leaves</p>
        </article>
        <article>
          <h3>${totalPayroll}</h3>
          <p>Total Payroll Recorded</p>
        </article>
      </section>

      <main className="grid">
        <section className="panel">
          <h2>Employee Service</h2>
          <form onSubmit={createEmployee} className="form">
            <input placeholder="Employee ID" value={employeeForm.employeeId} onChange={(e) => setEmployeeForm({ ...employeeForm, employeeId: e.target.value })} required />
            <input placeholder="Full Name" value={employeeForm.name} onChange={(e) => setEmployeeForm({ ...employeeForm, name: e.target.value })} required />
            <input placeholder="Department" value={employeeForm.department} onChange={(e) => setEmployeeForm({ ...employeeForm, department: e.target.value })} required />
            <input placeholder="Title" value={employeeForm.title} onChange={(e) => setEmployeeForm({ ...employeeForm, title: e.target.value })} required />
            <input placeholder="Salary" type="number" value={employeeForm.salary} onChange={(e) => setEmployeeForm({ ...employeeForm, salary: e.target.value })} required />
            <button type="submit">Add Employee</button>
          </form>
          <ul className="list">
            {employees.map((item) => (
              <li key={item._id}>{item.employeeId} | {item.name} | {item.department}</li>
            ))}
          </ul>
        </section>

        <section className="panel">
          <h2>Leave Service</h2>
          <form onSubmit={createLeave} className="form">
            <input placeholder="Employee ID" value={leaveForm.employeeId} onChange={(e) => setLeaveForm({ ...leaveForm, employeeId: e.target.value })} required />
            <input placeholder="Reason" value={leaveForm.reason} onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })} required />
            <input type="date" value={leaveForm.fromDate} onChange={(e) => setLeaveForm({ ...leaveForm, fromDate: e.target.value })} required />
            <input type="date" value={leaveForm.toDate} onChange={(e) => setLeaveForm({ ...leaveForm, toDate: e.target.value })} required />
            <button type="submit">Request Leave</button>
          </form>
          <ul className="list">
            {leaves.map((item) => (
              <li key={item._id}>
                {item.employeeId} | {item.reason} | {item.status}
                {item.status !== 'APPROVED' && (
                  <button className="mini" onClick={() => approveLeave(item._id)}>
                    Approve
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>

        <section className="panel">
          <h2>Payroll Service</h2>
          <form onSubmit={createPayroll} className="form">
            <input placeholder="Employee ID" value={payrollForm.employeeId} onChange={(e) => setPayrollForm({ ...payrollForm, employeeId: e.target.value })} required />
            <input placeholder="Month (YYYY-MM)" value={payrollForm.month} onChange={(e) => setPayrollForm({ ...payrollForm, month: e.target.value })} required />
            <input type="number" placeholder="Base Salary" value={payrollForm.baseSalary} onChange={(e) => setPayrollForm({ ...payrollForm, baseSalary: e.target.value })} required />
            <input type="number" placeholder="Bonus" value={payrollForm.bonus} onChange={(e) => setPayrollForm({ ...payrollForm, bonus: e.target.value })} />
            <input type="number" placeholder="Deductions" value={payrollForm.deductions} onChange={(e) => setPayrollForm({ ...payrollForm, deductions: e.target.value })} />
            <button type="submit">Generate Payroll</button>
          </form>
          <ul className="list">
            {payroll.map((item) => (
              <li key={item._id}>{item.employeeId} | {item.month} | Net: ${item.netPay}</li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
