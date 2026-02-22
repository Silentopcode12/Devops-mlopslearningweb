import { useEffect, useMemo, useState } from 'react';

const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const emptyEmployee = { employeeId: '', name: '', department: '', title: '', salary: '' };
const emptyLeave = { employeeId: '', reason: '', fromDate: '', toDate: '' };
const emptyPayroll = { employeeId: '', month: '', baseSalary: '', bonus: '', deductions: '' };
const moduleCatalog = [
  {
    name: 'Hire & Onboarding',
    items: ['Requisition Management', 'Career Portal', 'Interview Scheduling', 'Offer Management', 'Onboarding Checklist']
  },
  {
    name: 'Core HR & ESS',
    items: ['Employee Profiles', 'Employee Self-Service', 'Helpdesk', 'Documents', 'Pulse Surveys']
  },
  {
    name: 'Time, Attendance & Leave',
    items: ['GPS/Selfie Attendance', 'Shift & OT Management', 'Attendance Regularization', 'Advanced Leave Management', 'Roster Management']
  },
  {
    name: 'Payroll & Compliance',
    items: ['Payroll Automation', 'Statutory Compliance', 'Expense Management', 'Benefits Tracking', 'Tax Computation']
  },
  {
    name: 'Performance & Growth',
    items: ['OKRs & Goals', 'Continuous Feedback', 'Performance Reviews', '9-box Matrix', 'Career Path']
  }
];

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
        <div className="noise" />
        <nav className="topbar">
          <p className="brand">SHRESH HRMS</p>
          <div className="top-chips">
            <span>Microservices</span>
            <span>Realtime Ops</span>
            <span>Enterprise Ready</span>
          </div>
        </nav>
        <div className="hero-copy">
          <h1>Command Your Workforce with Precision</h1>
          <p>
            Verbaflo-style premium HRMS experience with clean workflows for employees, leave approvals, and payroll
            execution.
          </p>
        </div>
      </header>

      <section className="stats">
        <article className="stat-card">
          <small>HR Core</small>
          <h3>{totalHeadcount}</h3>
          <p>Total Employees</p>
        </article>
        <article className="stat-card">
          <small>Leave Desk</small>
          <h3>{approvedLeaves}</h3>
          <p>Approved Leaves</p>
        </article>
        <article className="stat-card">
          <small>Payroll Desk</small>
          <h3>${totalPayroll}</h3>
          <p>Total Payroll Recorded</p>
        </article>
      </section>

      <section className="panel module-panel">
        <div className="panel-head">
          <h2>Keka-Inspired HRMS Modules</h2>
          <span>Reference Model</span>
        </div>
        <div className="module-grid">
          {moduleCatalog.map((group) => (
            <article key={group.name} className="module-card">
              <h3>{group.name}</h3>
              <ul>
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <main className="grid">
        <section className="panel">
          <div className="panel-head">
            <h2>Employee Service</h2>
            <span>Service: 8082</span>
          </div>
          <form onSubmit={createEmployee} className="form">
            <input
              placeholder="Employee ID"
              value={employeeForm.employeeId}
              onChange={(e) => setEmployeeForm({ ...employeeForm, employeeId: e.target.value })}
              required
            />
            <input
              placeholder="Full Name"
              value={employeeForm.name}
              onChange={(e) => setEmployeeForm({ ...employeeForm, name: e.target.value })}
              required
            />
            <input
              placeholder="Department"
              value={employeeForm.department}
              onChange={(e) => setEmployeeForm({ ...employeeForm, department: e.target.value })}
              required
            />
            <input
              placeholder="Title"
              value={employeeForm.title}
              onChange={(e) => setEmployeeForm({ ...employeeForm, title: e.target.value })}
              required
            />
            <input
              placeholder="Salary"
              type="number"
              value={employeeForm.salary}
              onChange={(e) => setEmployeeForm({ ...employeeForm, salary: e.target.value })}
              required
            />
            <button type="submit">Add Employee</button>
          </form>
          <ul className="list">
            {employees.map((item) => (
              <li key={item._id}>
                <span>{item.employeeId}</span>
                <strong>{item.name}</strong>
                <em>{item.department}</em>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel">
          <div className="panel-head">
            <h2>Leave Service</h2>
            <span>Service: 8083</span>
          </div>
          <form onSubmit={createLeave} className="form">
            <input
              placeholder="Employee ID"
              value={leaveForm.employeeId}
              onChange={(e) => setLeaveForm({ ...leaveForm, employeeId: e.target.value })}
              required
            />
            <input placeholder="Reason" value={leaveForm.reason} onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })} required />
            <input type="date" value={leaveForm.fromDate} onChange={(e) => setLeaveForm({ ...leaveForm, fromDate: e.target.value })} required />
            <input type="date" value={leaveForm.toDate} onChange={(e) => setLeaveForm({ ...leaveForm, toDate: e.target.value })} required />
            <button type="submit">Request Leave</button>
          </form>
          <ul className="list">
            {leaves.map((item) => (
              <li key={item._id}>
                <span>{item.employeeId}</span>
                <strong>{item.reason}</strong>
                <em>{item.status}</em>
                {item.status !== 'APPROVED' && (
                  <button className="mini" type="button" onClick={() => approveLeave(item._id)}>
                    Approve
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>

        <section className="panel">
          <div className="panel-head">
            <h2>Payroll Service</h2>
            <span>Service: 8084</span>
          </div>
          <form onSubmit={createPayroll} className="form">
            <input
              placeholder="Employee ID"
              value={payrollForm.employeeId}
              onChange={(e) => setPayrollForm({ ...payrollForm, employeeId: e.target.value })}
              required
            />
            <input
              placeholder="Month (YYYY-MM)"
              value={payrollForm.month}
              onChange={(e) => setPayrollForm({ ...payrollForm, month: e.target.value })}
              required
            />
            <input
              type="number"
              placeholder="Base Salary"
              value={payrollForm.baseSalary}
              onChange={(e) => setPayrollForm({ ...payrollForm, baseSalary: e.target.value })}
              required
            />
            <input
              type="number"
              placeholder="Bonus"
              value={payrollForm.bonus}
              onChange={(e) => setPayrollForm({ ...payrollForm, bonus: e.target.value })}
            />
            <input
              type="number"
              placeholder="Deductions"
              value={payrollForm.deductions}
              onChange={(e) => setPayrollForm({ ...payrollForm, deductions: e.target.value })}
            />
            <button type="submit">Generate Payroll</button>
          </form>
          <ul className="list">
            {payroll.map((item) => (
              <li key={item._id}>
                <span>{item.employeeId}</span>
                <strong>{item.month}</strong>
                <em>Net ${item.netPay}</em>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
