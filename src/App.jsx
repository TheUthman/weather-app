import { useState } from "react"
import Weather from "./pages/Weather"
import Settings from "./pages/Settings"

const App = () => {
  const [showSettings, setShowSettings] = useState(false)
  const [preferences, setPreferences] = useState({
    units: "imperial",
    theme: "system",
    notifications: true,
    location: "auto",
    defaultCity: "San Francisco",
  })

  return (
    <div>
      {showSettings ? (
        <Settings
          onClose={() => setShowSettings(false)}
          preferences={preferences}
          setPreferences={setPreferences}
        />
      ) : (
        <Weather
          onOpenSettings={() => setShowSettings(true)}
          preferences={preferences}
        />
      )}
    </div>
  )
}

export default App
