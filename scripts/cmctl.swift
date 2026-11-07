// Styring af det originale CM 01/02 (ejerens "CM 01-02 Bosman Edition.app") til at studere flow og design.
// Byg: swiftc -O scripts/cmctl.swift -o /tmp/cmctl   (kræver Tilgængelighed for terminalen/Cursor til klik og taster)
//   cmctl shot <fil.png>        billede af spilvinduet (virker også i baggrunden)
//   cmctl click <x> <y>         venstreklik – x/y er pixels i billedet (Retina: 2560×1664 for et 1280×832-vindue)
//   cmctl rclick <x> <y>        højreklik
//   cmctl dclick <x> <y>        dobbeltklik
//   cmctl move <x> <y>          flyt musen (hover – fx undermenuer)
//   cmctl drag <x1> <y1> <x2> <y2>
//   cmctl key <return|escape|space|tab|up|down|left|right|tegn>
//   cmctl type <tekst>
// Klik og taster lægger spillet forrest og flytter den rigtige mus.
import AppKit
import CoreGraphics
import Foundation

let TITLE = "Championship Manager 01/02"

func window() -> (id: CGWindowID, frame: CGRect, pid: pid_t)? {
  let list = CGWindowListCopyWindowInfo([.optionAll], kCGNullWindowID) as! [[String: Any]]
  for w in list where (w[kCGWindowName as String] as? String) == TITLE {
    let b = w[kCGWindowBounds as String] as! [String: CGFloat]
    return (w[kCGWindowNumber as String] as! CGWindowID, CGRect(x: b["X"]!, y: b["Y"]!, width: b["Width"]!, height: b["Height"]!), w[kCGWindowOwnerPID as String] as! pid_t)
  }
  return nil
}

func fail(_ s: String) -> Never { FileHandle.standardError.write((s + "\n").data(using: .utf8)!); exit(1) }

guard let w = window() else { fail("spilvinduet \"\(TITLE)\" findes ikke – start CM 01/02") }
let args = Array(CommandLine.arguments.dropFirst())
guard let cmd = args.first else { fail("brug: cmctl shot|click|rclick|dclick|drag|key|type …") }

/// billedets pixels → skærmpunkter (billedet er i fuld opløsning; skalaen findes ud fra vinduets bredde)
func point(_ x: String, _ y: String) -> CGPoint {
  let scale = NSScreen.main?.backingScaleFactor ?? 2
  return CGPoint(x: w.frame.minX + (Double(x) ?? 0) / scale, y: w.frame.minY + (Double(y) ?? 0) / scale)
}

func activate() {
  NSRunningApplication(processIdentifier: w.pid)?.activate(options: [])
  usleep(250_000)
}

func mouse(_ p: CGPoint, _ down: CGEventType, _ up: CGEventType, _ button: CGMouseButton, clicks: Int = 1) {
  CGEvent(mouseEventSource: nil, mouseType: .mouseMoved, mouseCursorPosition: p, mouseButton: button)?.post(tap: .cghidEventTap)
  usleep(60_000)
  for i in 1...clicks {
    let d = CGEvent(mouseEventSource: nil, mouseType: down, mouseCursorPosition: p, mouseButton: button)!
    d.setIntegerValueField(.mouseEventClickState, value: Int64(i))
    d.post(tap: .cghidEventTap)
    usleep(40_000)
    let u = CGEvent(mouseEventSource: nil, mouseType: up, mouseCursorPosition: p, mouseButton: button)!
    u.setIntegerValueField(.mouseEventClickState, value: Int64(i))
    u.post(tap: .cghidEventTap)
    usleep(60_000)
  }
}

let KEYS: [String: CGKeyCode] = ["return": 36, "enter": 36, "escape": 53, "esc": 53, "space": 49, "tab": 48, "up": 126, "down": 125, "left": 123, "right": 124, "delete": 51]

func key(_ code: CGKeyCode) {
  CGEvent(keyboardEventSource: nil, virtualKey: code, keyDown: true)?.post(tap: .cghidEventTap)
  usleep(30_000)
  CGEvent(keyboardEventSource: nil, virtualKey: code, keyDown: false)?.post(tap: .cghidEventTap)
  usleep(40_000)
}

func typeText(_ s: String) {
  for ch in s.utf16 {
    let d = CGEvent(keyboardEventSource: nil, virtualKey: 0, keyDown: true)!
    var c = ch
    d.keyboardSetUnicodeString(stringLength: 1, unicodeString: &c)
    d.post(tap: .cghidEventTap)
    let u = CGEvent(keyboardEventSource: nil, virtualKey: 0, keyDown: false)!
    u.keyboardSetUnicodeString(stringLength: 1, unicodeString: &c)
    u.post(tap: .cghidEventTap)
    usleep(30_000)
  }
}

switch cmd {
case "shot":
  guard args.count >= 2 else { fail("brug: cmctl shot <fil.png>") }
  let p = Process()
  p.executableURL = URL(fileURLWithPath: "/usr/sbin/screencapture")
  p.arguments = ["-x", "-o", "-l", String(w.id), args[1]]
  try! p.run(); p.waitUntilExit()
  print(args[1])
case "click", "rclick", "dclick":
  guard args.count >= 3 else { fail("brug: cmctl \(cmd) <x> <y>") }
  activate()
  let p = point(args[1], args[2])
  if cmd == "rclick" { mouse(p, .rightMouseDown, .rightMouseUp, .right) }
  else { mouse(p, .leftMouseDown, .leftMouseUp, .left, clicks: cmd == "dclick" ? 2 : 1) }
case "move":
  guard args.count >= 3 else { fail("brug: cmctl move <x> <y>") }
  activate()
  // glidende bevægelse (spillets menuer reagerer på flere mouseMoved-hændelser, ikke ét spring)
  let to = point(args[1], args[2])
  let from = CGEvent(source: nil)?.location ?? to
  for i in 1...15 {
    let t = Double(i) / 15
    CGEvent(mouseEventSource: nil, mouseType: .mouseMoved, mouseCursorPosition: CGPoint(x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t), mouseButton: .left)?.post(tap: .cghidEventTap)
    usleep(20_000)
  }
case "drag":
  guard args.count >= 5 else { fail("brug: cmctl drag <x1> <y1> <x2> <y2>") }
  activate()
  let a = point(args[1], args[2]), b = point(args[3], args[4])
  CGEvent(mouseEventSource: nil, mouseType: .leftMouseDown, mouseCursorPosition: a, mouseButton: .left)?.post(tap: .cghidEventTap)
  for i in 1...12 {
    let t = Double(i) / 12
    CGEvent(mouseEventSource: nil, mouseType: .leftMouseDragged, mouseCursorPosition: CGPoint(x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t), mouseButton: .left)?.post(tap: .cghidEventTap)
    usleep(25_000)
  }
  CGEvent(mouseEventSource: nil, mouseType: .leftMouseUp, mouseCursorPosition: b, mouseButton: .left)?.post(tap: .cghidEventTap)
case "key":
  guard args.count >= 2 else { fail("brug: cmctl key <navn>") }
  activate()
  if let k = KEYS[args[1].lowercased()] { key(k) } else { typeText(args[1]) }
case "type":
  activate()
  typeText(args.dropFirst().joined(separator: " "))
default:
  fail("ukendt kommando: \(cmd)")
}
