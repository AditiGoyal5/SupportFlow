import { ArrowUpRight, Check } from 'lucide-react'
import Brand from './Brand.jsx'
import ThemeToggle from './ThemeToggle.jsx'

const benefits = [
  'One clear place for every support request',
  'Updates and responses stay connected',
  'The right view for every team role',
]

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-white lg:grid lg:grid-cols-[minmax(390px,0.92fr)_minmax(480px,1.08fr)]">
      <aside className="relative hidden min-h-screen overflow-hidden bg-[#101a34] px-12 py-10 text-white lg:flex lg:flex-col xl:px-16">
        <div
          aria-hidden="true"
          className="absolute -left-32 top-28 size-[460px] rounded-full bg-indigo-500/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-48 -right-36 size-[520px] rounded-full bg-blue-500/15 blur-3xl"
        />
        <div className="relative z-10">
          <Brand light />
        </div>

        <div className="relative z-10 my-auto max-w-xl py-20">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold tracking-wide text-indigo-100">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            YOUR SUPPORT WORKSPACE
          </div>
          <h1 className="max-w-lg text-5xl font-semibold leading-[1.08] tracking-[-0.055em] xl:text-[56px]">
            Support that feels <span className="text-indigo-300">in sync.</span>
          </h1>
          <p className="mt-6 max-w-md text-base leading-7 text-slate-300">
            Keep conversations, progress, and people connected in one thoughtful helpdesk.
          </p>

          <div className="mt-10 space-y-4">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-center gap-3 text-sm text-slate-200">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-white/10 text-indigo-200">
                  <Check size={14} strokeWidth={2.6} />
                </span>
                {benefit}
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-5 text-xs text-slate-400">
          <span>SupportFlow workspace</span>
          <span className="inline-flex items-center gap-1">
            Built for better support <ArrowUpRight size={13} />
          </span>
        </div>
      </aside>

      <main className="relative flex min-h-screen flex-col items-center justify-center px-5 py-8 sm:px-8 lg:px-12">
        <ThemeToggle className="absolute right-5 top-5 sm:right-8 lg:right-12 lg:top-8" />
        <div className="mb-9 w-full max-w-[440px] lg:hidden">
          <Brand />
        </div>
        <div className="w-full max-w-[440px]">{children}</div>
        <p className="mt-10 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} SupportFlow. All rights reserved.
        </p>
      </main>
    </div>
  )
}
