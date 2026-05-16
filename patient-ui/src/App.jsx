import { useState, useEffect } from 'react'

function App() {
  const [view, setView] = useState('landing') // 'landing', 'login', 'signup', 'app'
  const [activeTab, setActiveTab] = useState('dashboard')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Auth States
  const [formData, setFormData] = useState({ name: '', email: '', password: '' })
  const [currentUser, setCurrentUser] = useState(null)

  // Load user from session if exists
  useEffect(() => {
    const savedUser = localStorage.getItem('session_user')
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser))
      setView('app')
    }
  }, [])

  const handleSignup = (e) => {
    e.preventDefault()
    setError('')
    
    // Simple validation
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill all fields')
      return
    }

    // Save to simulated DB (localStorage)
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    if (users.find(u => u.email === formData.email)) {
      setError('User already exists with this email')
      return
    }

    users.push(formData)
    localStorage.setItem('users', JSON.stringify(users))
    
    setSuccess('Registration successful! Please login.')
    setView('login')
    setFormData({ ...formData, password: '' }) // Clear password
  }

  const handleLogin = (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const users = JSON.parse(localStorage.getItem('users') || '[]')
    const user = users.find(u => u.email === formData.email && u.password === formData.password)

    if (user) {
      setCurrentUser(user)
      localStorage.setItem('session_user', JSON.stringify(user))
      setView('app')
    } else {
      setError('Invalid email or password')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('session_user')
    setCurrentUser(null)
    setView('landing')
  }

  const healthMetrics = {
    heartRate: 72,
    bp: "120/80",
    oxygen: 98,
    temp: "98.6"
  }

  const NavItem = ({ id, label, icon }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
        activeTab === id 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  )

  // --- LANDING PAGE ---
  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-white font-sans overflow-x-hidden">
        {/* Navbar */}
        <nav className="flex justify-between items-center px-10 py-6 max-w-7xl mx-auto border-b border-slate-50">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
               <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m0 0v2m0-2h2m-20v2m0-2h2m2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tighter">SecureHealth</span>
          </div>
          <div className="flex items-center space-x-8">
            <button onClick={() => {setError(''); setSuccess(''); setView('login')}} className="bg-slate-900 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-600 transition shadow-xl shadow-slate-900/10">Sign In</button>
          </div>
        </nav>

        {/* Hero Section */}
        <header className="max-w-7xl mx-auto px-10 pt-20 pb-32 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
           <div className="animate-in fade-in slide-in-from-left-8 duration-1000">
              <span className="bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6 inline-block">Secure & Private</span>
              <h1 className="text-6xl lg:text-7xl font-black text-slate-900 leading-[1.1] mb-8 tracking-tight">
                 Your Health, <br/> 
                 <span className="text-blue-600 underline decoration-blue-200">Reimagined.</span>
              </h1>
              <p className="text-xl text-slate-500 mb-10 leading-relaxed max-w-lg">
                 Connect with top medical specialists, manage your health records, and track your metrics in a single, secure microservices platform.
              </p>
              <div className="flex space-x-4">
                 <button onClick={() => {setError(''); setSuccess(''); setView('signup')}} className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-lg hover:bg-blue-700 transition shadow-2xl shadow-blue-500/40 transform hover:scale-105 active:scale-95">Get Started Free</button>
              </div>
           </div>
           <div className="relative animate-in fade-in slide-in-from-right-8 duration-1000">
              <div className="absolute -inset-4 bg-blue-400/10 blur-3xl rounded-full"></div>
              <img src="/hero.png" alt="Healthcare Hero" className="relative rounded-3xl shadow-2xl shadow-blue-500/10 border border-slate-100 transform rotate-2 hover:rotate-0 transition-transform duration-700 w-full object-cover h-[500px]" />
           </div>
        </header>
      </div>
    )
  }

  // --- AUTH PAGE (LOGIN/SIGNUP) ---
  if (view === 'login' || view === 'signup') {
    const isSignup = view === 'signup'
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
        <div className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 p-12 border border-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>
          
          <div className="text-center mb-8">
            <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">
              {isSignup ? "Create Account" : "Welcome Back"}
            </h2>
            <p className="text-slate-500 font-medium italic">
              {isSignup ? "Start your healthcare journey today" : "Sign in to manage your health"}
            </p>
          </div>

          {error && <div className="mb-6 p-4 bg-rose-50 text-rose-600 text-sm font-bold rounded-xl border border-rose-100 animate-bounce">{error}</div>}
          {success && <div className="mb-6 p-4 bg-emerald-50 text-emerald-600 text-sm font-bold rounded-xl border border-emerald-100">{success}</div>}

          <form className="space-y-5" onSubmit={isSignup ? handleSignup : handleLogin}>
            {isSignup && (
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                <input 
                  type="text" 
                  placeholder="John Doe" 
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-blue-600 outline-none transition-all font-medium" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required 
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
              <input 
                type="email" 
                placeholder="patient@example.com" 
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-blue-600 outline-none transition-all font-medium" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required 
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-blue-600 outline-none transition-all font-medium" 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required 
              />
            </div>
            
            <button type="submit" className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl hover:bg-blue-700 transition shadow-xl shadow-blue-500/30 text-lg transform hover:scale-[1.02] active:scale-95">
              {isSignup ? "Sign Up" : "Sign In"}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-slate-500 font-medium">
              {isSignup ? "Already have an account?" : "Don't have an account?"} 
              <button 
                onClick={() => { setError(''); setSuccess(''); setView(isSignup ? 'login' : 'signup') }} 
                className="ml-2 text-blue-600 font-black hover:underline underline-offset-4"
              >
                {isSignup ? "Login here" : "Sign up free"}
              </button>
            </p>
            <button onClick={() => setView('landing')} className="mt-6 text-slate-400 hover:text-slate-600 text-sm font-bold uppercase tracking-widest">Back to Home</button>
          </div>
        </div>
      </div>
    )
  }

  // --- MAIN APP DASHBOARD ---
  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 p-8 flex flex-col sticky top-0 h-screen overflow-y-auto">
        <div className="flex items-center space-x-3 mb-10 px-2 group cursor-pointer">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition">
             <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m0 0v2m0-2h2m-20v2m0-2h2m2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
          </div>
          <span className="text-2xl font-black text-slate-900 tracking-tighter">SecureHealth</span>
        </div>
        
        <nav className="flex-1 space-y-2">
          <NavItem id="dashboard" label="Dashboard" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>} />
          <NavItem id="auth" label="Identity" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>} />
          <NavItem id="records" label="Records" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} />
          <NavItem id="appointments" label="Appointments" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />
          <NavItem id="analytics" label="Analytics" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>} />
          <NavItem id="audit" label="Audit Logs" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
          <NavItem id="billing" label="Payments" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} />
        </nav>

        <button onClick={handleLogout} className="mt-8 flex items-center space-x-3 px-4 py-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          <span className="font-bold">Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-12 overflow-y-auto bg-slate-50">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-4xl font-black text-slate-900 capitalize tracking-tight">{activeTab}</h2>
            <p className="text-slate-500 font-medium">Platform Activity Overview</p>
          </div>
          <div className="flex items-center space-x-4">
             <div className="flex items-center space-x-4 bg-white p-2 pr-6 border border-slate-200 rounded-full shadow-sm">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  {currentUser?.name?.substring(0, 2).toUpperCase() || 'JD'}
                </div>
                <div>
                   <p className="text-sm font-black text-slate-900 leading-none mb-1">{currentUser?.name || 'John Doe'}</p>
                   <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Premium Patient</p>
                </div>
             </div>
          </div>
        </header>

        {/* View Selection */}
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
           {activeTab === 'dashboard' && (
             <div className="space-y-12">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                 {Object.entries(healthMetrics).map(([key, val], idx) => (
                   <div key={idx} className="p-8 bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/20 hover:scale-105 transition-transform cursor-pointer group">
                     <span className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">{key.replace('bp', 'Blood Pressure')}</span>
                     <div className="text-4xl font-black text-slate-900 mt-3 group-hover:text-blue-600 transition-colors">{val}</div>
                   </div>
                 ))}
               </div>
               
               <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/20 p-10 overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50"></div>
                  <h3 className="font-black text-2xl text-slate-900 mb-8 tracking-tight">Real-time Diagnostics</h3>
                  <div className="h-80 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 space-y-4">
                     <svg className="w-12 h-12 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                     <p className="font-bold">Neural Health Mapping Active for {currentUser?.name}...</p>
                  </div>
               </div>
             </div>
           )}

           {/* Placeholder for other views */}
           {activeTab !== 'dashboard' && (
             <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/30 p-20 text-center">
                <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-blue-100/50">
                   <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-4 capitalize">{activeTab} System Active</h3>
                <p className="text-slate-400 font-medium max-w-sm mx-auto">Connected to microservices. Secure session for {currentUser?.email}.</p>
                <button className="mt-10 bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold hover:bg-blue-600 transition shadow-xl">Refresh Service</button>
             </div>
           )}
        </div>
      </main>
    </div>
  )
}

export default App
