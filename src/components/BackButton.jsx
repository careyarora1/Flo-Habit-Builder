export default function BackButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="absolute top-5 left-5 w-10 h-10 flex items-center justify-center rounded-full text-warm-500 hover:bg-warm-100 transition-colors z-20"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
    </button>
  )
}
