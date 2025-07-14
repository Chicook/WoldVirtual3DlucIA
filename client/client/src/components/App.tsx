import { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { MetaversoProvider } from '../contexts/MetaversoContext'
import { Web3Provider } from '../contexts/Web3Context'
import MetaversoApp from './MetaversoApp'
import { LoadingSpinner } from './ui/LoadingSpinner'

// Lazy loading de componentes avanzados con error boundaries
const AvatarSelector = lazy(() => import('./avatar/AvatarSelector'))
const Profile = lazy(() => import('./profile/Profile'))
const ChatSystem = lazy(() => import('./chat/ChatSystem'))
const IslandMap = lazy(() => import('./IslandMap'))

function App() {
  return (
    <Web3Provider>
      <MetaversoProvider>
        <Router>
          <div className="App">
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/" element={<MetaversoApp />} />
                <Route path="/avatar" element={<AvatarSelector />} />
                <Route path="/profile" element={<Profile onClose={() => {}} />} />
                <Route path="/chat" element={<ChatSystem />} />
                <Route path="/map" element={<IslandMap />} />
              </Routes>
            </Suspense>
          </div>
        </Router>
      </MetaversoProvider>
    </Web3Provider>
  )
}

export default App 