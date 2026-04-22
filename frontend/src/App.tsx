import TicketsPage from './pages/TicketsPage'

function App() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F4F8' }}>
      <nav style={{ backgroundColor: '#12101F' }} className="px-6 py-4 mb-4">
        <div className="flex items-center gap-3">
          <div style={{ backgroundColor: 'rgba(124,58,237,0.2)', borderRadius: '10px' }} className="p-2">
            <span className="text-xl font-bold" style={{ color: '#A78BFA' }}>SC</span>
          </div>
          <div>
            <h1 className="text-white font-semibold text-lg" style={{ fontFamily: 'DM Sans' }}>
              Smart Campus Operations Hub
            </h1>
            <p style={{ color: '#9B97B8', fontSize: '0.75rem' }}>Campus Management System</p>
          </div>
        </div>
      </nav>
      <TicketsPage />
    </div>
  )
}

export default App