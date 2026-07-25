import React, { useState, useEffect } from 'react';
import { X, Key, User, ShieldCheck, Check, AlertTriangle, ExternalLink, RefreshCw, Tv, Copy, CheckCircle, Clock, Sparkles, Lock } from 'lucide-react';
import { generateDeviceCode, pollDeviceToken, generateDemoDeviceCode, exchangeOAuthToken } from '../services/traktApi';

export default function TraktSettingsModal({ 
  isOpen, 
  onClose, 
  traktConfig = {}, 
  onSaveConfig, 
  isLiveMode, 
  setIsLiveMode 
}) {
  const [authMode, setAuthMode] = useState('manual'); // 'manual' or 'device'
  const [clientId, setClientId] = useState(traktConfig?.clientId || '');
  const [clientSecret, setClientSecret] = useState(traktConfig?.clientSecret || '');
  const [username, setUsername] = useState(traktConfig?.username || '');
  const [bearerToken, setBearerToken] = useState(traktConfig?.bearerToken || '');
  const [pinCode, setPinCode] = useState('');
  const [isExchangingPin, setIsExchangingPin] = useState(false);
  
  // Device Auth Flow State
  const [deviceData, setDeviceData] = useState(null); // { device_code, user_code, verification_url, expires_in, interval, isDemo }
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [pollStatus, setPollStatus] = useState(null); // 'waiting', 'success', 'expired', 'error'
  const [deviceError, setDeviceError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [copiedCode, setCopiedCode] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  // Sync state if props change
  useEffect(() => {
    if (traktConfig) {
      if (traktConfig.clientId) setClientId(traktConfig.clientId);
      if (traktConfig.clientSecret) setClientSecret(traktConfig.clientSecret);
      if (traktConfig.username) setUsername(traktConfig.username);
      if (traktConfig.bearerToken) setBearerToken(traktConfig.bearerToken);
    }
  }, [traktConfig]);

  // Countdown timer effect
  useEffect(() => {
    if (!isOpen || !deviceData || timeLeft <= 0 || pollStatus !== 'waiting') return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setPollStatus('expired');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, deviceData, timeLeft, pollStatus]);

  // Polling loop effect
  useEffect(() => {
    if (!isOpen || !deviceData || pollStatus !== 'waiting') return;

    if (deviceData.isDemo) {
      const demoTimer = setTimeout(() => {
        setPollStatus('success');
      }, 6000);
      return () => clearTimeout(demoTimer);
    }

    const intervalSec = Math.max(3, deviceData.interval || 5) * 1000;
    const pollTimer = setInterval(async () => {
      try {
        const res = await pollDeviceToken(deviceData.device_code, clientId, clientSecret);
        if (res.status === 'success' && res.data?.access_token) {
          setPollStatus('success');
          setBearerToken(res.data.access_token);
          
          if (onSaveConfig) {
            onSaveConfig({
              clientId: clientId.trim(),
              clientSecret: clientSecret.trim(),
              username: username.trim(),
              bearerToken: res.data.access_token
            });
          }
          if (setIsLiveMode) setIsLiveMode(true);
          clearInterval(pollTimer);
        } else if (res.status === 'expired') {
          setPollStatus('expired');
          clearInterval(pollTimer);
        }
      } catch (err) {
        console.warn('Device auth poll check:', err.message);
      }
    }, intervalSec);

    return () => clearInterval(pollTimer);
  }, [isOpen, deviceData, pollStatus, clientId, clientSecret, username, onSaveConfig, setIsLiveMode]);

  // Early return ONLY AFTER all hooks have been registered!
  if (!isOpen) return null;

  // Real Device Code Generation
  const handleStartDeviceAuth = async () => {
    if (!clientId.trim()) {
      setDeviceError('Please enter your Trakt Client ID to generate a live device code.');
      return;
    }

    setIsGeneratingCode(true);
    setPollStatus(null);
    setDeviceError(null);
    setDeviceData(null);

    try {
      const data = await generateDeviceCode(clientId);
      setDeviceData(data);
      setTimeLeft(data.expires_in || 600);
      setPollStatus('waiting');
    } catch (err) {
      setPollStatus('error');
      setDeviceError(err.message);
    } finally {
      setIsGeneratingCode(false);
    }
  };

  // Demo Sandbox Device Code Generation
  const handleStartDemoDeviceAuth = () => {
    setIsGeneratingCode(true);
    setPollStatus(null);
    setDeviceError(null);
    setDeviceData(null);

    setTimeout(() => {
      const demoData = generateDemoDeviceCode();
      setDeviceData(demoData);
      setTimeLeft(demoData.expires_in);
      setPollStatus('waiting');
      setIsGeneratingCode(false);
    }, 400);
  };

  // PIN Exchange helper
  const handleExchangePin = async () => {
    if (!pinCode.trim() || !clientId.trim() || !clientSecret.trim()) {
      setTestResult({ 
        success: false, 
        message: 'Please enter your Client ID, Client Secret, and authorization PIN code.' 
      });
      return;
    }

    setIsExchangingPin(true);
    setTestResult(null);

    try {
      const res = await exchangeOAuthToken(pinCode, clientId, clientSecret);
      if (res.access_token) {
        setBearerToken(res.access_token);
        setTestResult({ success: true, message: 'Successfully authorized! Access token retrieved.' });
        if (onSaveConfig) {
          onSaveConfig({
            clientId: clientId.trim(),
            clientSecret: clientSecret.trim(),
            username: username.trim(),
            bearerToken: res.access_token
          });
        }
        if (setIsLiveMode) setIsLiveMode(true);
      }
    } catch (err) {
      setTestResult({ success: false, message: `PIN Authorization failed: ${err.message}` });
    } finally {
      setIsExchangingPin(false);
    }
  };

  // Copy code helper
  const handleCopyUserCode = () => {
    if (deviceData?.user_code) {
      navigator.clipboard.writeText(deviceData.user_code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleManualSave = (e) => {
    e.preventDefault();
    if (onSaveConfig) {
      onSaveConfig({
        clientId: clientId.trim(),
        clientSecret: clientSecret.trim(),
        username: username.trim(),
        bearerToken: bearerToken.trim()
      });
    }
    if (setIsLiveMode) setIsLiveMode(true);
    if (onClose) onClose();
  };

  const handleTestConnection = async () => {
    if (!clientId.trim()) {
      setTestResult({ success: false, message: 'Please enter your Trakt Client ID.' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const response = await fetch(`https://api.trakt.tv/genres/movies`, {
        headers: {
          'Content-Type': 'application/json',
          'trakt-api-version': '2',
          'trakt-api-key': clientId.trim()
        }
      });

      if (response.ok) {
        setTestResult({ success: true, message: 'Successfully connected to Trakt API v2!' });
        if (setIsLiveMode) setIsLiveMode(true);
      } else {
        setTestResult({ 
          success: false, 
          message: `Trakt API error ${response.status}: ${response.statusText}` 
        });
      }
    } catch (err) {
      setTestResult({ 
        success: false, 
        message: `Network Connection Error: ${err.message}` 
      });
    } finally {
      setIsTesting(false);
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const pinAuthUrl = clientId.trim() 
    ? `https://trakt.tv/oauth/authorize?response_type=code&client_id=${clientId.trim()}&redirect_uri=urn:ietf:wg:oauth:2.0:oob`
    : 'https://trakt.tv/oauth/applications';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="glass-panel w-full max-w-lg rounded-3xl p-6 border border-slate-700/80 shadow-2xl bg-slate-950 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <Key className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-100">Trakt API Authentication</h3>
            <p className="text-xs text-slate-400">
              Connect your existing Trakt Client ID, Client Secret, or Username
            </p>
          </div>
        </div>

        {/* Auth Method Tabs */}
        <div className="flex p-1 bg-slate-900 rounded-xl border border-slate-800 mb-6 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setAuthMode('manual')}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-2 ${
              authMode === 'manual'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Client ID & Secret / Username</span>
          </button>
          <button
            type="button"
            onClick={() => setAuthMode('device')}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-2 ${
              authMode === 'device'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>Kodi-Style Device Code</span>
          </button>
        </div>

        {/* TAB 1: MANUAL CREDENTIALS (CLIENT ID & SECRET / USERNAME / TOKEN) */}
        {authMode === 'manual' && (
          <form onSubmit={handleManualSave} className="space-y-4">
            
            {/* Trakt Client ID */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                <span>Trakt Client ID</span>
                <a
                  href="https://trakt.tv/oauth/applications"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-rose-400 hover:underline flex items-center gap-1 font-medium"
                >
                  View My Trakt Apps <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </label>
              <input
                type="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="Paste your existing Client ID"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500 font-mono"
              />
            </div>

            {/* Trakt Client Secret */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Trakt Client Secret
              </label>
              <input
                type="password"
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                placeholder="Paste your existing Client Secret"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500 font-mono"
              />
            </div>

            {/* Trakt Username */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Trakt Username (For Watched History & Likes)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. cinephile_99"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
                />
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              </div>
            </div>

            {/* Trakt PIN Authorization Option */}
            <div className="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-800/40 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-purple-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Authorize Account via Trakt PIN</span>
                </span>
                {clientId.trim() && (
                  <a
                    href={pinAuthUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-amber-400 hover:underline flex items-center gap-1 font-bold"
                  >
                    Get Authorization PIN <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  placeholder="Paste PIN code here..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500 font-mono"
                />
                <button
                  type="button"
                  onClick={handleExchangePin}
                  disabled={isExchangingPin || !pinCode.trim()}
                  className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs disabled:opacity-40 transition-all shrink-0"
                >
                  {isExchangingPin ? 'Exchanging...' : 'Authorize PIN'}
                </button>
              </div>
            </div>

            {testResult && (
              <div className={`p-3 rounded-xl text-xs flex items-start gap-2 border ${
                testResult.success 
                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40' 
                  : 'bg-rose-950/40 text-rose-300 border-rose-800/40'
              }`}>
                {testResult.success ? (
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                <span>Test API</span>
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl gradient-accent text-white text-xs font-bold shadow-lg shadow-rose-950/40 hover:opacity-95 transition-all"
              >
                Save Credentials
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: KODI-STYLE DEVICE CODE AUTH */}
        {authMode === 'device' && (
          <div className="space-y-4">
            
            {/* Client ID Field */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Trakt Client ID:
              </label>
              <input
                type="text"
                value={clientId}
                onChange={(e) => {
                  setClientId(e.target.value);
                  if (deviceError) setDeviceError(null);
                }}
                placeholder="Paste Client ID"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500 font-mono"
              />
            </div>

            {/* Error Banner */}
            {deviceError && (
              <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-rose-300">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>Authentication Notice</span>
                </div>
                <p className="leading-tight text-[11px]">{deviceError}</p>
              </div>
            )}

            {!deviceData ? (
              <div className="text-center p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-100">Activate Trakt Account</h4>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                    Click below to get your 8-character activation code to authorize on <strong>trakt.tv/activate</strong>.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleStartDeviceAuth}
                    disabled={isGeneratingCode}
                    className="w-full sm:w-1/2 py-2.5 rounded-xl gradient-accent text-white font-bold text-xs shadow-lg shadow-rose-950/40 hover:opacity-95 transition-all flex items-center justify-center gap-2"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingCode ? 'animate-spin' : ''}`} />
                    <span>Get Live Code</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleStartDemoDeviceAuth}
                    disabled={isGeneratingCode}
                    className="w-full sm:w-1/2 py-2.5 rounded-xl bg-purple-900/40 hover:bg-purple-800/50 text-purple-200 border border-purple-700/50 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Try Demo Code</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-fadeIn">
                
                {/* User Code Big Display Box */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-purple-950/40 to-slate-900 border border-purple-500/40 text-center space-y-3 shadow-xl">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-300 flex items-center justify-center gap-1.5">
                    {deviceData.isDemo && <Sparkles className="w-3.5 h-3.5 text-amber-300" />}
                    {deviceData.isDemo ? 'Sandbox Demo Activation Code' : 'Your Trakt Activation Code'}
                  </span>
                  
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-3xl sm:text-4xl font-extrabold tracking-widest text-amber-300 font-mono select-all bg-slate-950 px-4 py-2 rounded-xl border border-amber-500/30">
                      {deviceData.user_code}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyUserCode}
                      className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all"
                      title="Copy Code"
                    >
                      {copiedCode ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>

                  {copiedCode && (
                    <p className="text-[11px] text-emerald-400 font-medium">Code copied to clipboard!</p>
                  )}

                  {/* Link to Trakt Activate */}
                  <div className="pt-1">
                    <a
                      href={deviceData.verification_url || 'https://trakt.tv/activate'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-950/40 transition-all"
                    >
                      <span>Open trakt.tv/activate</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* Status Indicator & Countdown */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    {pollStatus === 'waiting' && (
                      <>
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
                        <span className="text-slate-300 font-medium">
                          {deviceData.isDemo ? 'Simulating activation authorization...' : 'Waiting for authorization on Trakt...'}
                        </span>
                      </>
                    )}
                    {pollStatus === 'success' && (
                      <>
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-300 font-bold">Successfully Connected!</span>
                      </>
                    )}
                    {pollStatus === 'expired' && (
                      <>
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                        <span className="text-rose-300 font-medium">Code Expired. Please regenerate.</span>
                      </>
                    )}
                  </div>

                  {pollStatus === 'waiting' && (
                    <div className="flex items-center gap-1 text-slate-400 font-mono">
                      <Clock className="w-3.5 h-3.5 text-purple-400" />
                      <span>{formatTimer(timeLeft)}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={handleStartDeviceAuth}
                    className="text-xs text-rose-400 hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Regenerate Code
                  </button>
                  {pollStatus === 'success' && (
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
                    >
                      Done & Close
                    </button>
                  )}
                </div>

              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
