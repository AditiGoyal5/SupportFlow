import { ArrowRight, Clock3, ShieldCheck, Ticket } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

function getFirstName(name) {
  return name.trim().split(/\s+/)[0] || 'there'
}

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <div className="space-y-7">
      <section className="relative overflow-hidden rounded-[26px] bg-[#172344] px-6 py-7 text-white shadow-lg shadow-slate-200/70 sm:px-9 sm:py-9">
        <div
          aria-hidden="true"
          className="absolute -right-16 -top-32 size-80 rounded-full bg-indigo-500/30 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute bottom-[-130px] right-[22%] size-64 rounded-full bg-blue-400/15 blur-3xl"
        />
        <div className="relative z-10 max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-indigo-100">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            YOUR SUPPORT WORKSPACE
          </div>
          <h2 className="text-3xl font-semibold tracking-[-0.05em] sm:text-[38px]">
            Good to see you, {getFirstName(user.name)}.
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-[15px]">
            Your support workspace is ready. Follow your requests and stay up to date with the team.
          </p>
          <Link
            to="/app/tickets"
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-slate-900 transition hover:bg-indigo-50"
          >
            Open my tickets
            <ArrowRight size={16} />
          </Link>
        </div>
        <div className="absolute bottom-0 right-7 hidden translate-y-1/4 sm:block lg:right-16">
          <div className="grid size-40 place-items-center rounded-full border border-white/10 bg-white/[0.04]">
            <div className="grid size-28 place-items-center rounded-full border border-white/10 bg-white/[0.05]">
              <div className="grid size-[68px] place-items-center rounded-[22px] bg-white/10 text-indigo-100">
                <Ticket size={31} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold tracking-[-0.03em] text-slate-900">
              Workspace overview
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Your account is connected and ready to use.
            </p>
          </div>
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium capitalize text-slate-600">
            {user.role} account
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <OverviewCard
            icon={Ticket}
            title="Ticket workspace"
            description="Open the ticket area available for your account."
            to="/app/tickets"
            action="View tickets"
          />
          <OverviewCard
            icon={Clock3}
            title="Stay up to date"
            description="Ticket responses and activity will be available in your workspace."
            to="/app/tickets"
            action="Go to workspace"
          />
          <OverviewCard
            icon={ShieldCheck}
            title="Account access"
            description={`Signed in as ${user.email}. Your ${user.role} permissions are active.`}
            to="/app/tickets"
            action="Continue"
          />
        </div>
      </section>
    </div>
  )
}

function OverviewCard({ icon: Icon, title, description, to, action }) {
  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/40">
      <span className="grid size-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
        <Icon size={19} strokeWidth={1.9} />
      </span>
      <h4 className="mt-4 text-sm font-semibold text-slate-900">{title}</h4>
      <p className="mt-1.5 min-h-10 text-sm leading-5 text-slate-500">{description}</p>
      <Link
        to={to}
        className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
      >
        {action} <ArrowRight size={14} />
      </Link>
    </article>
  )
}
