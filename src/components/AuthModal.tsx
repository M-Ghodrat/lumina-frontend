import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail, 
  sendEmailVerification, 
  updateProfile,
  signInWithPopup
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { Mail, Lock, User as UserIcon, X, AlertCircle, CheckCircle, Chrome } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'signin' | 'signup';
}

export default function AuthModal({ isOpen, onClose, initialTab = 'signin' }: AuthModalProps) {
  const [tab, setTab] = useState<'signin' | 'signup' | 'forgot'>(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');
    setMessage('');
    try {
      await signInWithPopup(auth, googleProvider);
      setMessage('Successfully signed in with Google!');
      setTimeout(() => {
        onClose();
        resetForm();
      }, 1000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Google authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setError('');
    setMessage('');
    setIsLoading(false);
  };

  const handleEmailAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      if (tab === 'signin') {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        if (!user.emailVerified) {
          setMessage('Welcome back! Note: Your email is not verified yet. We have resent a verification link if you wish to verify.');
          try {
            await sendEmailVerification(user);
          } catch (vErr) {
            console.warn('Verification email rate limit or error', vErr);
          }
        } else {
          setMessage('Signed in successfully!');
        }
        setTimeout(() => {
          onClose();
          resetForm();
        }, 1500);

      } else if (tab === 'signup') {
        if (!name.trim()) throw new Error('Please enter your full name.');
        if (password.length < 6) throw new Error('Password must be at least 6 characters.');

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Update display name
        await updateProfile(user, { displayName: name });
        
        // Send email verification
        try {
          await sendEmailVerification(user);
          setMessage('Account created! A Gmail/Email verification link has been sent to your inbox. Please verify before continuing.');
        } catch (vErr) {
          setMessage('Account created successfully! We recommend verifying your email.');
        }

        setTimeout(() => {
          setTab('signin');
          setPassword('');
          setError('');
        }, 4000);

      } else if (tab === 'forgot') {
        await sendPasswordResetEmail(auth, email);
        setMessage('A password reset link has been dispatched to your email address.');
        setTimeout(() => {
          setTab('signin');
          resetForm();
        }, 3000);
      }
    } catch (err: any) {
      console.error(err);
      let readableErr = err.message || 'An authentication error occurred.';
      if (err.code === 'auth/invalid-credential') {
        readableErr = 'Incorrect password or email credentials.';
      } else if (err.code === 'auth/email-already-in-use') {
        readableErr = 'This email and profile is already registered.';
      } else if (err.code === 'auth/weak-password') {
        readableErr = 'The password must contain at least 6 characters.';
      } else if (err.code === 'auth/invalid-email') {
        readableErr = 'Please supply a correctly formatted email address.';
      }
      setError(readableErr);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal body */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl border border-gray-100 p-8 md:p-10 z-10 overflow-hidden"
        >
          {/* Subtle accent blur decorator inside modal */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-accent/10 rounded-full blur-2xl -z-10 translate-x-6 -translate-y-6" />

          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full text-gray-400 hover:text-black hover:bg-gray-100 transition-all"
          >
            <X size={18} />
          </button>

          {/* Header Title */}
          <div className="text-center mb-8">
            <h4 className="text-[10px] uppercase tracking-widest text-brand-accent font-bold mb-2">Gastown Studio Auth</h4>
            <h2 className="text-3xl font-light">
              {tab === 'signin' && 'Welcome Back'}
              {tab === 'signup' && 'Create Ritual Profile'}
              {tab === 'forgot' && 'Reset Password'}
            </h2>
            <p className="text-xs text-gray-400 mt-2">
              {tab === 'signin' && 'Sign in to access secure online reservations'}
              {tab === 'signup' && 'Verify and keep track of your skin journey'}
              {tab === 'forgot' && 'We’ll trigger a recovery link to your inbox'}
            </p>
          </div>

          {/* Error and Info Notices */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }} 
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 text-xs flex gap-2 items-start"
            >
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          {message && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }} 
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-emerald-50 text-emerald-700 text-xs flex gap-2 items-start"
            >
              <CheckCircle size={16} className="shrink-0 mt-0.5" />
              <span>{message}</span>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleEmailAction} className="space-y-4">
            {tab === 'signup' && (
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-semibold text-gray-400 block ml-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Jane Smith"
                    className="input-field pl-11"
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}

            {tab !== 'forgot' && (
              <>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-semibold text-gray-400 block ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="jane@example.com"
                      className="input-field pl-11"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] uppercase font-semibold text-gray-400 block">Password</label>
                    {tab === 'signin' && (
                      <button 
                        type="button"
                        onClick={() => { setTab('forgot'); setError(''); setMessage(''); }}
                        className="text-[10px] font-bold text-brand-accent hover:underline"
                        disabled={isLoading}
                      >
                        Forgot?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="input-field pl-11"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </>
            )}

            {tab === 'forgot' && (
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-semibold text-gray-400 block ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Enter associated email..."
                    className="input-field pl-11"
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="pill-button-accent w-full py-4 mt-6 flex justify-center items-center gap-2"
            >
              {isLoading ? (
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <>
                  {tab === 'signin' && 'Sign In'}
                  {tab === 'signup' && 'Register Details'}
                  {tab === 'forgot' && 'Recover Email Link'}
                </>
              )}
            </button>
          </form>

          {/* Social login divider */}
          {tab !== 'forgot' && (
            <>
              <div className="relative my-6 text-center">
                <hr className="border-gray-100" />
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-[10px] uppercase tracking-widest text-gray-400">
                  Or continue with
                </span>
              </div>

              {/* Google integration */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2.5 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-all text-xs text-gray-600 font-medium disabled:opacity-50"
              >
                <Chrome size={16} className="text-[#4285F4]" />
                <span>Google Account (Gmail)</span>
              </button>
            </>
          )}

          {/* Footer Navigation */}
          <div className="text-center mt-8 text-xs text-gray-400">
            {tab === 'signin' && (
              <>
                Don't have a profile yet?{' '}
                <button 
                  onClick={() => { setTab('signup'); setError(''); setMessage(''); }} 
                  className="font-bold text-brand-ink hover:text-brand-accent pr-1 hover:underline underline-offset-2"
                >
                  Create Profile
                </button>
              </>
            )}
            {tab === 'signup' && (
              <>
                Already secure?{' '}
                <button 
                  onClick={() => { setTab('signin'); setError(''); setMessage(''); }} 
                  className="font-bold text-brand-ink hover:text-brand-accent pr-1 hover:underline underline-offset-2"
                >
                  Sign In
                </button>
              </>
            )}
            {tab === 'forgot' && (
              <button 
                onClick={() => { setTab('signin'); setError(''); setMessage(''); }} 
                className="font-bold text-brand-ink hover:text-brand-accent pr-1 hover:underline underline-offset-2"
              >
                Back to Sign In
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
