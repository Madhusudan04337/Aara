import { useState } from 'react'
import './PremiumView.css'

const PLANS = [
  {
    id: 'individual',
    title: 'Individual',
    price: '₹119 / month',
    trial: '1 month free',
    accounts: '1 account',
    features: [
      'Ad-free music listening',
      'Download to listen offline',
      'Play anywhere - even on TV and speakers',
      'Prepaid or subscription options'
    ],
    popular: true,
    color: '#B91FE1'
  },
  {
    id: 'duo',
    title: 'Duo',
    price: '₹149 / month',
    trial: '1 month free',
    accounts: '2 accounts',
    features: [
      '2 Premium accounts for a couple under one roof',
      'Ad-free music listening & offline playback',
      'Duo Mix: a playlist for two, regularly updated'
    ],
    popular: false,
    color: '#ffc107'
  },
  {
    id: 'family',
    title: 'Family',
    price: '₹179 / month',
    trial: '1 month free',
    accounts: 'Up to 6 accounts',
    features: [
      '6 Premium accounts for family members under one roof',
      'Block explicit music for kids',
      'Ad-free music, offline listening, unlimited skips'
    ],
    popular: false,
    color: '#3498db'
  },
  {
    id: 'student',
    title: 'Student',
    price: '₹59 / month',
    trial: '1 month free',
    accounts: '1 verified student account',
    features: [
      'Special 50% discount for eligible university students',
      'Ad-free music listening',
      'Download to listen offline on any device'
    ],
    popular: false,
    color: '#9b59b6'
  }
]

const PremiumView = () => {
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [subscribedToast, setSubscribedToast] = useState(false)

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan)
    setSubscribedToast(true)
    setTimeout(() => {
      setSubscribedToast(false)
    }, 4000)
  }

  return (
    <div className="premium-view" role="main" aria-label="Aara Premium Subscription">
      {/* ── HERO BANNER ── */}
      <div className="premium-view__hero">
        <span className="premium-view__badge">AARA PREMIUM</span>
        <h1 className="premium-view__headline">
          Get Premium free for 1 month
        </h1>
        <p className="premium-view__subheadline">
          Just ₹119/month after. Debit and credit cards accepted. Cancel anytime.
        </p>

        <div className="premium-view__hero-actions">
          <button
            className="premium-view__btn-primary"
            onClick={() => handleSelectPlan(PLANS[0])}
            id="btn-get-premium-hero"
          >
            Get 1 month free
          </button>
          <button
            className="premium-view__btn-secondary"
            onClick={() => {
              const el = document.getElementById('plans-section')
              if (el) el.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            View all plans
          </button>
        </div>

        <span className="premium-view__terms">
          Terms and conditions apply. 1 month free not available for users who have already tried Premium.
        </span>
      </div>

      {/* ── WHY PREMIUM SECTION ── */}
      <div className="premium-view__features-section">
        <h2 className="premium-view__section-title">Why go Premium?</h2>
        <div className="premium-view__features-grid">
          <div className="premium-feature-card">
            <div className="premium-feature-icon">
              <i className="fa-solid fa-circle-down" />
            </div>
            <h3>Download music</h3>
            <p>Listen anywhere, even without Wi-Fi or mobile data.</p>
          </div>

          <div className="premium-feature-card">
            <div className="premium-feature-icon">
              <i className="fa-solid fa-ban" />
            </div>
            <h3>Ad-free music</h3>
            <p>Enjoy nonstop music without audio interruptions.</p>
          </div>

          <div className="premium-feature-card">
            <div className="premium-feature-icon">
              <i className="fa-solid fa-forward-fast" />
            </div>
            <h3>Unlimited skips</h3>
            <p>Just tap next to jump to any song you want anytime.</p>
          </div>

          <div className="premium-feature-card">
            <div className="premium-feature-icon">
              <i className="fa-solid fa-headphones-simple" />
            </div>
            <h3>High audio quality</h3>
            <p>Listen in crisp, studio-grade 320kbps fidelity.</p>
          </div>
        </div>
      </div>

      {/* ── PLANS SECTION ── */}
      <div className="premium-view__plans-section" id="plans-section">
        <h2 className="premium-view__section-title">Pick your Premium</h2>
        <p className="premium-view__section-sub">Listen without limits on your phone, speaker, and other devices.</p>

        <div className="premium-view__plans-grid">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`premium-plan-card ${plan.popular ? 'premium-plan-card--popular' : ''}`}
              id={`plan-card-${plan.id}`}
            >
              {plan.popular && (
                <div className="premium-plan-tag">MOST POPULAR</div>
              )}

              <div className="premium-plan-header">
                <div className="premium-plan-trial-pill">{plan.trial}</div>
                <h3 className="premium-plan-title">{plan.title}</h3>
                <p className="premium-plan-price">{plan.price}</p>
                <span className="premium-plan-accounts">{plan.accounts}</span>
              </div>

              <hr className="premium-plan-divider" />

              <ul className="premium-plan-features">
                {plan.features.map((feat, i) => (
                  <li key={i}>
                    <i className="fa-solid fa-check" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <button
                className="premium-plan-btn"
                onClick={() => handleSelectPlan(plan)}
                id={`btn-plan-${plan.id}`}
              >
                Get Started
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Toast confirmation */}
      {subscribedToast && (
        <div className="premium-toast" role="alert">
          <i className="fa-solid fa-circle-check" />
          <span>Success! You have selected the <strong>{selectedPlan?.title}</strong> plan trial. Enjoy your 1 month free!</span>
        </div>
      )}
    </div>
  )
}

export default PremiumView
