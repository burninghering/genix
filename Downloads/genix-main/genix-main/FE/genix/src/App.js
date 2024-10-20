import React from "react"
import DeviceStatusPage from "./Page/DeviceStatusPage";
import LoginPage from "./Page/LoginPage";
import { BrowserRouter, Route, Routes, Switch, Link } from "react-router-dom";


function App() {
  if (process.env.NODE_ENV === "production") {
    console = window.console || {};
    console.log = function no_console() { };
    console.warn = function no_console() { };
    console.error = function () { };
  }
  return (
    <div className="App">
      <div className="App-header">
        <BrowserRouter>
          <Routes>
            <Route exact path="/" element={<LoginPage />} />
            <Route path="/Device" element={<DeviceStatusPage />} />
          </Routes>
        </BrowserRouter>
      </div>
    </div>
  )
}

export default App;
