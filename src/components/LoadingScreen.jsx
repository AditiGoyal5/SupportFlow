import Brand from './Brand.jsx'
import LoadingSpinner from './LoadingSpinner.jsx'

export default function LoadingScreen({ label = 'Getting things ready for you' }) {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-6">
      <div className="flex flex-col items-center gap-8">
        <Brand />
        <LoadingSpinner label={label} />
      </div>
    </main>
  )
}
