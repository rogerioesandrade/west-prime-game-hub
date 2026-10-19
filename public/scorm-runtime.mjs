                          
                                      
                                  
                                  
                                                 
                                  
                           
                                         
                                        
 

export const SCORM12_DEFAULTS                         = {
  "cmi.core.student_id": "west-prime-demo",
  "cmi.core.student_name": "Visitante West Prime",
  "cmi.core.lesson_status": "not attempted",
  "cmi.core.lesson_location": "",
  "cmi.core.lesson_mode": "normal",
  "cmi.core.credit": "no-credit",
  "cmi.core.entry": "ab-initio",
  "cmi.core.exit": "",
  "cmi.suspend_data": "",
}

// A browser-local demonstration runtime; it never contacts an LMS.
export function createScorm12Runtime(initial                        , save                                          ) {
  const values = { ...SCORM12_DEFAULTS, ...initial }
  values["cmi.core.entry"] = values["cmi.suspend_data"] ? "resume" : "ab-initio"
  let initialized = false, finished = false, error = "0"
  const messages                         = { "0": "No error", "101": "General exception", "201": "Invalid argument", "301": "Not initialized" }
  function valid() { if (!initialized || finished) { error = "301"; return false }; return true }
  function persist() {
    try { save({ ...values }); error = "0"; return "true" }
    catch { error = "101"; return "false" }
  }
  const api             = {
    LMSInitialize(value) {
      if (value !== "") { error = "201"; return "false" }
      if (initialized || finished) { error = "101"; return "false" }
      initialized = true; error = "0"; return "true"
    },
    LMSGetValue(key) {
      if (!valid()) return ""
      error = "0"
      if (key.endsWith("._count")) {
        const prefix = key.slice(0, -6)
        return String(new Set(Object.keys(values).filter(k => k.startsWith(prefix)).map(k => k.slice(prefix.length).split(".")[0]).filter(k => /^\d+$/.test(k))).size)
      }
      return values[key] ?? ""
    },
    LMSSetValue(key, value) {
      if (!valid()) return "false"
      if (!key.startsWith("cmi.")) { error = "201"; return "false" }
      values[key] = String(value); error = "0"; return "true"
    },
    LMSCommit(value) {
      if (value !== "") { error = "201"; return "false" }
      return valid() ? persist() : "false"
    },
    LMSFinish(value) {
      if (value !== "") { error = "201"; return "false" }
      if (!valid() || persist() !== "true") return "false"
      finished = true; return "true"
    },
    LMSGetLastError: () => error,
    LMSGetErrorString: code => messages[code] ?? "Unknown error",
    LMSGetDiagnostic: code => messages[code || error] ?? "Unknown error",
  }
  return { api, flush: () => initialized && !finished ? persist() : "true" }
}
