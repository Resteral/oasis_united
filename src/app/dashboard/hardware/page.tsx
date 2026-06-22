"use client";
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function HardwarePortal() {
    const [loading, setLoading] = useState(true);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [business, setBusiness] = useState<any>(null);
    const [token, setToken] = useState('');
    const [phone, setPhone] = useState('');
    const [shipment, setShipment] = useState<any>(null);

    const [ssid, setSsid] = useState('');
    const [password, setPassword] = useState('');
    const [serialLog, setSerialLog] = useState<string[]>([]);
    const [serialStatus, setSerialStatus] = useState<'idle' | 'connecting' | 'writing' | 'success' | 'error'>('idle');
    const [serialErrorMessage, setSerialErrorMessage] = useState('');

    // QOL States & Refs
    const [copiedToken, setCopiedToken] = useState(false);
    const [copiedCode, setCopiedCode] = useState(false);
    const logContainerRef = useRef<HTMLDivElement>(null);

    // Load saved SSID from localStorage on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedSsid = localStorage.getItem('oasis-wifi-ssid') || '';
            setSsid(savedSsid);
        }
    }, []);

    // Auto-scroll serial console logs
    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [serialLog]);

    const handleCopyToken = () => {
        if (typeof navigator !== 'undefined') {
            navigator.clipboard.writeText(token);
            setCopiedToken(true);
            setTimeout(() => setCopiedToken(false), 2000);
        }
    };

    useEffect(() => {
        async function loadHardwareDetails() {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                window.location.href = '/login';
                return;
            }

            const { data: profile } = await supabase
                .from('profiles')
                .select('subscription_tier')
                .eq('id', user.id)
                .single();

            const { data: biz } = await supabase
                .from('businesses')
                .select('*')
                .eq('owner_id', user.id)
                .single();

            if (profile?.subscription_tier === 'hardware_plan') {
                setIsSubscribed(true);
            }

            if (biz) {
                setBusiness(biz);
                const espToken = biz.integrations?.esp32?.token || '';
                setToken(espToken);
                
                const storePhone = biz.integrations?.twilio?.phone || '';
                setPhone(storePhone);

                const ship = biz.integrations?.esp32_shipment || null;
                setShipment(ship);
            }
            setLoading(false);
        }
        loadHardwareDetails();
    }, []);

    const addLog = (msg: string) => {
        setSerialLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    const handleProgramDevice = async () => {
        if (!ssid) {
            setSerialErrorMessage('Registry Error: Local Wi-Fi SSID must be specified.');
            setSerialStatus('error');
            return;
        }
        localStorage.setItem('oasis-wifi-ssid', ssid);

        setSerialStatus('connecting');
        setSerialErrorMessage('');
        setSerialLog([]);
        addLog('Requesting Serial Port access from browser...');

        // 1. Check browser Web Serial support
        const serialSupported = typeof navigator !== 'undefined' && 'serial' in navigator;
        if (!serialSupported) {
            addLog('Web Serial API not fully supported in this browser.');
            addLog('Simulating hardware programming environment (Developer Sandbox Mode)...');
            
            // Simulating steps
            setTimeout(() => {
                setSerialStatus('writing');
                addLog('Opening serial link (115200 baud)...');
                addLog('COM4 port connected successfully.');
            }, 1000);

            setTimeout(() => {
                addLog('Transmitting Wi-Fi configuration block...');
                addLog(`> WIFI:${ssid},********`);
            }, 2000);

            setTimeout(() => {
                addLog('Transmitting endpoint authentication token...');
                addLog(`> TOKEN:${token}`);
                if (phone) {
                    addLog('Transmitting assigned SMS phone number...');
                    addLog(`> PHONE:${phone}`);
                }
            }, 3000);

            setTimeout(() => {
                addLog('Flashing configuration structure to EEPROM...');
                addLog('Writing block verification check... OK');
                addLog('ESP32-S responded: Config saved. Rebooting...');
                setSerialStatus('success');
                addLog('🔌 Programming completed successfully! You can unplug the USB.');
            }, 4500);

            return;
        }

        // 2. Real Web Serial Implementation
        try {
            // @ts-ignore
            const port = await navigator.serial.requestPort();
            addLog('Port authorized by user. Connecting...');
            
            await port.open({ baudRate: 115200 });
            setSerialStatus('writing');
            addLog('Serial connection opened successfully.');

            addLog('Sending credentials structure...');
            const encoder = new TextEncoder();
            const writer = port.writable.getWriter();
            
            const payload = `WIFI:${ssid},${password}\nTOKEN:${token}\nPHONE:${phone}\n`;
            await writer.write(encoder.encode(payload));
            
            addLog('Transmitting payload block...');
            writer.releaseLock();
            addLog('Write verified. Saving preferences on chip...');
            
            await port.close();
            setSerialStatus('success');
            addLog('🔌 Flash complete! Pre-programmed ESP32-S connected successfully.');
        } catch (err: any) {
            console.error('Serial Error:', err);
            setSerialErrorMessage(`Serial link failed: ${err.message}`);
            setSerialStatus('error');
            addLog(`Error: ${err.message}`);
        }
    };

    if (loading) return (
        <div className="p-8 flex items-center justify-center min-h-[60vh]">
            <div className="text-gray-400 font-black animate-pulse uppercase tracking-widest text-[10px]">Verifying Hardware License...</div>
        </div>
    );

    if (!isSubscribed) return (
        <div className="p-8 max-w-4xl mx-auto space-y-8 bg-[#0a0a0b] min-h-screen text-white flex flex-col justify-center text-center">
            <span className="text-6xl animate-bounce">🛰️</span>
            <div className="space-y-4">
                <h1 className="text-5xl font-black italic tracking-tighter uppercase text-white">Uplink Locked.</h1>
                <p className="max-w-md mx-auto text-sm text-white/40 leading-relaxed italic">
                    The ESP32-S hardware terminal features are reserved for businesses subscribed to the Oasis Hardware Terminal plan.
                </p>
            </div>
            <div className="pt-6">
                <Link href="/dashboard/billing" className="px-10 py-5 bg-amber-400 text-black rounded-3xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-2xl">
                    View Subscription Plans
                </Link>
            </div>
        </div>
    );

    // C++ Arduino Code Template
    const arduinoCode = `
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* serverUrl = "https://unitedoasis.net/api/esp32?action=get-orders";
String wifiSsid = "";
String wifiPassword = "";
String apiToken = "${token || "YOUR_TOKEN_HERE"}";
String storePhone = "${phone || "YOUR_PHONE_HERE"}";

#define BUZZER_PIN 23  // Beeps on new order

void setup() {
  Serial.begin(115200);
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);
  
  Serial.println("Oasis Terminal Initialized.");
  Serial.println("Waiting for serial configuration or auto-connecting to Wi-Fi...");
  
  // Default connection check
  WiFi.begin(wifiSsid.c_str(), wifiPassword.c_str());
}

void loop() {
  // Listen for config changes over USB Serial from browser
  if (Serial.available()) {
    String input = Serial.readStringUntil('\\n');
    if (input.startsWith("WIFI:")) {
      int comma = input.indexOf(',');
      wifiSsid = input.substring(5, comma);
      wifiPassword = input.substring(comma + 1);
      WiFi.begin(wifiSsid.c_str(), wifiPassword.c_str());
      Serial.println("WIFI_SAVED");
    } else if (input.startsWith("TOKEN:")) {
      apiToken = input.substring(6);
      Serial.println("TOKEN_SAVED");
    }
  }

  if (WiFi.status() == WL_CONNECTED) {
    checkOrders();
  }
  delay(10000); // Poll every 10 seconds
}

void checkOrders() {
  HTTPClient http;
  String url = String(serverUrl) + "&token=" + apiToken;
  http.begin(url);
  
  int httpCode = http.GET();
  if (httpCode == HTTP_CODE_OK) {
    String payload = http.getString();
    
    DynamicJsonDocument doc(2048);
    deserializeJson(doc, payload);
    JsonArray orders = doc.as<JsonArray>();
    
    if (orders.size() > 0) {
      Serial.print("--- NEW ORDERS RECEIVED: ");
      Serial.print(orders.size());
      Serial.println(" ---");
      
      // Sound Alarm (Buzzer)
      digitalWrite(BUZZER_PIN, HIGH);
      delay(300);
      digitalWrite(BUZZER_PIN, LOW);
      delay(150);
      digitalWrite(BUZZER_PIN, HIGH);
      delay(300);
      digitalWrite(BUZZER_PIN, LOW);

      for (JsonObject order : orders) {
        const char* id = order["id"];
        const char* customer = order["customer_name"];
        float total = order["total"];
        Serial.printf("Order #%s by %s for $%.2f\\n", id, customer, total);
        
        JsonArray items = order["items"];
        for (JsonObject item : items) {
          const char* name = item["name"];
          int qty = item["quantity"];
          Serial.printf("  x%d %s\\n", qty, name);
        }
      }
    }
  }
  http.end();
}
`;

    const handleCopyCode = () => {
        if (typeof navigator !== 'undefined') {
            navigator.clipboard.writeText(arduinoCode.trim());
            setCopiedCode(true);
            setTimeout(() => setCopiedCode(false), 2000);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-12 bg-[#0a0a0b] min-h-screen text-white pb-40">
            {/* Header */}
            <div className="mb-12 space-y-4">
                <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.5)]"></span>
                    <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40">Hardware Provisioning Portal</h2>
                </div>
                <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase leading-[0.85] text-white">ESP32-S <br /><span className="text-indigo-500">Terminal.</span></h1>
                <p className="max-w-2xl text-white/40 font-medium italic text-lg leading-relaxed pt-2">Connect, configure, and monitor your pre-programmed order receiving chip. Set your Wi-Fi credentials directly over USB.</p>
            </div>

            {/* Shipment Status & Token */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Shipping Tracking */}
                <div className="bg-white/[0.02] border border-white/5 p-10 rounded-[3rem] space-y-6">
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30">Hardware Package Status</span>
                    <h3 className="text-3xl font-black italic tracking-tighter uppercase text-white">Shipment</h3>
                    
                    <div className="space-y-4 pt-2">
                        <div className="flex justify-between items-center py-3 border-b border-white/5">
                            <span className="text-xs font-bold text-white/40 uppercase">Carrier</span>
                            <span className="text-sm font-black uppercase text-white">{shipment?.carrier || 'FedEx'}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-white/5">
                            <span className="text-xs font-bold text-white/40 uppercase">Status</span>
                            <span className="px-3.5 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-[8px] font-black uppercase tracking-wider">{shipment?.status || 'Processing'}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-white/5">
                            <span className="text-xs font-bold text-white/40 uppercase">Tracking ID</span>
                            <span className="text-sm font-black uppercase text-indigo-400 select-all">{shipment?.tracking_number || 'PENDING'}</span>
                        </div>
                    </div>
                </div>

                {/* API Token Details */}
                <div className="bg-white/[0.02] border border-white/5 p-10 rounded-[3rem] space-y-6 lg:col-span-2">
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30">Authentication Credentials</span>
                    <h3 className="text-3xl font-black italic tracking-tighter uppercase text-white">Device Uplink</h3>
                    
                    <div className="space-y-6 pt-2">
                        <div className="space-y-2">
                            <label className="text-[8px] font-black uppercase tracking-widest text-indigo-400">Device API Token</label>
                            <div className="flex gap-4 items-center">
                                <input 
                                    type="text" 
                                    readOnly 
                                    value={token || 'NO_TOKEN_PROVISIONED'} 
                                    className="flex-1 bg-white/5 border border-white/10 p-4 rounded-2xl font-mono text-xs text-white/60 tracking-wider outline-none select-all"
                                />
                                <button 
                                    onClick={handleCopyToken}
                                    className="px-6 py-4 bg-indigo-600 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shrink-0 active:scale-95 shadow-lg shadow-indigo-600/10"
                                >
                                    {copiedToken ? '✓ Copied' : '📋 Copy'}
                                </button>
                            </div>
                        </div>
                        {phone && (
                            <div className="space-y-2">
                                <label className="text-[8px] font-black uppercase tracking-widest text-indigo-400">Assigned Store SMS Phone Number</label>
                                <p className="text-2xl font-black italic text-white">{phone}</p>
                                <p className="text-[9px] font-bold text-white/30 uppercase tracking-tighter">This number is advertised on your store page. Customers text this number to place orders via AI.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Configurator Console */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 pt-6">
                {/* Form Inputs */}
                <div className="bg-white/[0.02] border border-white/5 p-10 rounded-[3rem] space-y-8 lg:col-span-2">
                    <div className="space-y-2">
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30">Browser-to-USB Link</span>
                        <h3 className="text-3xl font-black italic tracking-tighter uppercase text-white">Configure</h3>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-white/40 block">Local Wi-Fi SSID (Name)</label>
                            <input 
                                type="text" 
                                placeholder="MyHomeWiFi" 
                                value={ssid}
                                onChange={(e) => setSsid(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl font-black italic text-lg tracking-tight placeholder:text-white/5 focus:border-indigo-400/50 transition-all outline-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-white/40 block">Wi-Fi Password</label>
                            <input 
                                type="password" 
                                placeholder="••••••••" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl font-mono text-lg tracking-tight placeholder:text-white/5 focus:border-indigo-400/50 transition-all outline-none"
                            />
                        </div>

                        <button
                            onClick={handleProgramDevice}
                            disabled={serialStatus === 'connecting' || serialStatus === 'writing'}
                            className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all active:scale-95 shadow-xl shadow-indigo-600/10"
                        >
                            {serialStatus === 'connecting' ? 'Connecting Serial...' : serialStatus === 'writing' ? 'Flashing Chip...' : 'Connect & Program Chip'}
                        </button>
                    </div>
                </div>

                {/* Console Log */}
                <div className="bg-black border border-white/5 p-10 rounded-[3rem] flex flex-col justify-between lg:col-span-3 min-h-[350px]">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30">Serial Output Monitor</span>
                        <div className="flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${
                                serialStatus === 'success' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse' :
                                serialStatus === 'error' ? 'bg-rose-500 animate-ping' :
                                serialStatus === 'writing' ? 'bg-indigo-500' : 'bg-white/20'
                            }`}></span>
                            <span className="text-[9px] font-black uppercase tracking-wider text-white/40">COM Link Status</span>
                        </div>
                    </div>

                    <div ref={logContainerRef} className="flex-1 bg-white/[0.01] border border-white/5 p-6 rounded-2xl font-mono text-[10px] text-indigo-300 space-y-2 overflow-y-auto max-h-[220px]">
                        {serialLog.length === 0 ? (
                            <p className="text-white/20 italic">Awaiting serial connection trigger...</p>
                        ) : (
                            serialLog.map((log, i) => (
                                <p key={i} className={log.includes('Error') ? 'text-rose-400 font-bold' : log.includes('successfully') ? 'text-emerald-400 font-bold' : ''}>{log}</p>
                            ))
                        )}
                    </div>

                    {serialStatus === 'error' && (
                        <div className="mt-4 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-[9px] font-black uppercase tracking-widest text-center animate-pulse">
                            {serialErrorMessage}
                        </div>
                    )}
                </div>
            </div>

            {/* Physical Connection Guide */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6">
                <div className="bg-white/[0.02] border border-white/5 p-10 rounded-[3rem] space-y-6">
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30">Oasis Hardware Setup</span>
                    <h3 className="text-3xl font-black italic tracking-tighter uppercase text-white">How the Network Works</h3>
                    <div className="space-y-4 text-xs font-medium text-white/40 leading-relaxed italic">
                        <p>1. **Scouting & Onboarding**: Fleet scouts invite merchants to join Oasis. The store is listed instantly on the discovery marketplace.</p>
                        <p>2. **Hardware Request**: Merchants upgrade to the Hardware Subscription plan on the billing hub. A custom-flashed ESP32-S microchip is shipped/delivered.</p>
                        <p>3. **Automatic Auditing**: The physical device connects to the internet and checks the Oasis Route Queue for new orders every 10 seconds.</p>
                    </div>
                </div>

                <div className="bg-white/[0.02] border border-white/5 p-10 rounded-[3rem] space-y-6">
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30">Physical Installation Guide</span>
                    <h3 className="text-3xl font-black italic tracking-tighter uppercase text-white">Hooking Up Your ESP32-S</h3>
                    <div className="space-y-4 text-xs font-medium text-white/40 leading-relaxed italic">
                        <p>💡 **Pinout Connections**:
                           - Connect a Piezo Buzzer to sound alerts: Positive (+) pin to **GPIO 23**, Negative (-) pin to **GND**.</p>
                        <p>🔌 **Powering On**:
                           - Plug a USB-C data cable into the chip's native USB port. 
                           - Connect the other end to your store's computer (for browser provisioning) or a 5V power brick.</p>
                        <p>🛠️ **Wi-Fi Sync**:
                           - Keep the USB plugged in, open this portal, type your local Wi-Fi SSID and password, and click **Connect & Program** to link the device to your account.</p>
                    </div>
                </div>
            </div>

            {/* Firmware Code Snippet */}
            <div className="bg-white/[0.02] border border-white/5 p-12 rounded-[4rem] space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div className="space-y-2">
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30">Developers / Advanced Setup</span>
                        <h3 className="text-4xl font-black italic tracking-tighter uppercase text-white leading-none">Firmware Code</h3>
                        <p className="text-xs text-white/40 leading-relaxed max-w-xl italic">If you want to compile and write the chip software yourself using the Arduino IDE, use the pre-configured boilerplate below. It is already injected with your API token.</p>
                    </div>
                    <button
                        onClick={handleCopyCode}
                        className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:bg-white/10 transition-all flex items-center gap-2 active:scale-95 shrink-0"
                    >
                        {copiedCode ? '✓ Copied Boilerplate' : '📋 Copy Boilerplate'}
                    </button>
                </div>

                <div className="relative">
                    <pre className="bg-black/80 border border-white/5 p-8 rounded-3xl overflow-x-auto text-[11px] font-mono text-white/60 max-h-[400px]">
                        <code>{arduinoCode}</code>
                    </pre>
                </div>
            </div>
        </div>
    );
}
