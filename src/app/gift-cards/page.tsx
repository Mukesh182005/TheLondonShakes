'use client';

import React, { useState } from 'react';
import { giftCardAmounts } from '@/data/restaurantData';
import { Gift, CreditCard, CheckCircle, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function GiftCardsPage() {
  const [selectedAmount, setSelectedAmount] = useState(100);
  const [customAmount, setCustomAmount] = useState('');
  
  // Purchase form states
  const [purchaseForm, setPurchaseForm] = useState({
    recipientName: '',
    recipientEmail: '',
    senderName: '',
    message: ''
  });
  const [purchased, setPurchased] = useState(false);
  const [giftCode, setGiftCode] = useState('');

  // Balance query states
  const [queryCode, setQueryCode] = useState('');
  const [queryResult, setQueryResult] = useState<number | null>(null);
  const [hasQueried, setHasQueried] = useState(false);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setPurchaseForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePurchaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!purchaseForm.recipientName || !purchaseForm.recipientEmail || !purchaseForm.senderName) {
      toast.error('Please complete all required fields.');
      return;
    }
    const finalAmount = customAmount ? parseFloat(customAmount) : selectedAmount;
    if (isNaN(finalAmount) || finalAmount <= 0) {
      toast.error('Please specify a valid gift amount.');
      return;
    }

    const mockCode = 'GFT-' + Math.random().toString(36).substring(2, 8).toUpperCase() + '-' + finalAmount;
    setGiftCode(mockCode);
    setPurchased(true);
    toast.success('Gift card order placed successfully!');
  };

  const handleBalanceCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryCode.trim()) {
      toast.error('Please input a valid Gift Card code.');
      return;
    }
    
    // Simulating database query based on the code layout
    const upperCode = queryCode.trim().toUpperCase();
    if (upperCode.startsWith('GFT-') && upperCode.split('-').length === 3) {
      const amountStr = upperCode.split('-')[2];
      const parsed = parseFloat(amountStr);
      if (!isNaN(parsed)) {
        setQueryResult(parsed);
        setHasQueried(true);
        return;
      }
    }

    // Default mock response for other numbers
    if (upperCode === 'GIFT-100') {
      setQueryResult(100);
    } else if (upperCode === 'GIFT-500') {
      setQueryResult(500);
    } else {
      setQueryResult(0);
    }
    setHasQueried(true);
  };

  const resetPurchase = () => {
    setPurchaseForm({
      recipientName: '',
      recipientEmail: '',
      senderName: '',
      message: ''
    });
    setCustomAmount('');
    setPurchased(false);
  };

  const activeAmount = customAmount ? parseFloat(customAmount) : selectedAmount;

  return (
    <div className="page-wrapper" style={{ background: 'var(--black)', color: 'var(--text-primary)' }}>
      
      {/* Page Header */}
      <div 
        style={{ 
          background: 'linear-gradient(180deg, #090b07 0%, var(--dark-bg) 100%)', 
          padding: '80px 0 60px', 
          textAlign: 'center',
          borderBottom: '1px solid rgba(201, 168, 76, 0.08)'
        }}
      >
        <div className="container">
          <div className="section-eyebrow" style={{ justifyContent: 'center' }}>Share The Hearth</div>
          <h1 className="section-title">Gift <em>Cards</em></h1>
          <div className="gold-divider" />
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '16px auto 0', lineHeight: 1.6 }}>
            Bespoke digital vouchers redeemable for dining reservations, cellar events, or orders.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: '80px 0 120px' }}>
        <div className="container">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            
            {/* Purchase Gift Card Column */}
            <div style={{ background: '#0d0d0d', border: '1px solid rgba(201,168,76,0.15)', padding: '48px' }}>
              {purchased ? (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <div style={{ width: '64px', height: '64px', background: 'var(--gold-muted)', border: '1px solid var(--gold)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                    <CheckCircle size={28} color="var(--gold)" />
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--cream)', marginBottom: '8px' }}>
                    Gift Voucher Created
                  </h3>
                  <div style={{ fontFamily: 'var(--font-sans)', color: 'var(--text-secondary)', fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '24px' }}>
                    CARD VALUE: ₹{activeAmount}
                  </div>
                  
                  <div style={{ border: '1px dashed rgba(201,168,76,0.4)', padding: '24px', background: 'var(--black)', color: 'var(--cream)', fontFamily: 'monospace', fontSize: '1.1rem', letterSpacing: '0.05em', marginBottom: '24px' }}>
                    {giftCode}
                  </div>

                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', lineHeight: 1.6, marginBottom: '32px' }}>
                    The digital voucher has been sent to **{purchaseForm.recipientEmail}** on behalf of **{purchaseForm.senderName}**. You can test checking this balance on the right!
                  </p>

                  <button className="btn-gold" onClick={resetPurchase}>
                    <span>Create Another Card</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePurchaseSubmit} className="flex flex-col gap-6">
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--gold)', marginBottom: '8px' }}>
                    Purchase Digital Card
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.6, marginBottom: '16px' }}>
                    Send an elegant digital dining credit directly to their inbox, accompanied by your personalized greetings.
                  </p>

                  {/* Amount Selector */}
                  <div>
                    <label className="form-label">Select Amount (₹)</label>
                    <div className="grid grid-cols-5 gap-2 mb-3">
                      {giftCardAmounts.map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => {
                            setSelectedAmount(amt);
                            setCustomAmount('');
                          }}
                          style={{
                            padding: '12px 0',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            border: '1px solid var(--dark-border-2)',
                            background: !customAmount && selectedAmount === amt ? 'var(--gold)' : 'var(--black)',
                            color: !customAmount && selectedAmount === amt ? 'var(--black)' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                          }}
                        >
                          ₹{amt}
                        </button>
                      ))}
                    </div>
                    
                    {/* Custom Amount */}
                    <div style={{ position: 'relative' }}>
                      <input
                        type="number"
                        placeholder="Or specify custom amount"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        style={{ paddingLeft: '32px' }}
                      />
                      <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>₹</span>
                    </div>
                  </div>

                  {/* Recipient details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="form-label">Recipient Name *</label>
                      <input 
                        name="recipientName"
                        required
                        value={purchaseForm.recipientName}
                        onChange={handleTextChange}
                        placeholder="Recipient name"
                      />
                    </div>
                    <div>
                      <label className="form-label">Recipient Email *</label>
                      <input 
                        name="recipientEmail"
                        type="email"
                        required
                        value={purchaseForm.recipientEmail}
                        onChange={handleTextChange}
                        placeholder="recipient@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Sender Name *</label>
                    <input 
                      name="senderName"
                      required
                      value={purchaseForm.senderName}
                      onChange={handleTextChange}
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label className="form-label">Personal Greeting</label>
                    <textarea 
                      name="message"
                      value={purchaseForm.message}
                      onChange={handleTextChange}
                      placeholder="Your message details..."
                      rows={3}
                      style={{ resize: 'vertical' }}
                    />
                  </div>

                  <button type="submit" className="btn-gold" style={{ width: '100%', marginTop: '12px' }}>
                    <span>Place Order · ₹{activeAmount}</span>
                  </button>
                </form>
              )}
            </div>

            {/* Check Balance & Inclusions Column */}
            <div className="flex flex-col gap-8">
              {/* Balance Check */}
              <div style={{ background: '#0d0d0d', border: '1px solid rgba(201,168,76,0.15)', padding: '40px' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--gold)', marginBottom: '16px' }}>
                  Query Card Balance
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.6, marginBottom: '24px' }}>
                  Provide your Gift Card identifier number to check the remaining balance on your card. (e.g. Test `GIFT-500` or use your generated code above).
                </p>

                <form onSubmit={handleBalanceCheck} className="flex gap-3 mb-6">
                  <div className="relative flex-grow">
                    <input 
                      value={queryCode}
                      onChange={(e) => setQueryCode(e.target.value)}
                      placeholder="Enter gift card code"
                      style={{ paddingLeft: '40px' }}
                    />
                    <Search size={14} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  </div>
                  <button type="submit" className="btn-outline" style={{ padding: '0 24px', fontSize: '0.72rem' }}>
                    Query
                  </button>
                </form>

                {hasQueried && (
                  <div style={{ background: 'var(--black)', border: '1px solid var(--dark-border-2)', padding: '20px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      Remaining Balance
                    </div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', color: queryResult && queryResult > 0 ? 'var(--gold)' : 'var(--text-secondary)', fontWeight: 600 }}>
                      ₹{queryResult}
                    </div>
                  </div>
                )}
              </div>

              {/* Inclusions */}
              <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '40px' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--cream)', marginBottom: '24px' }}>
                  Redemption Inclusions
                </h3>
                
                {[
                  { Icon: Gift, title: 'Bespoke Dining', desc: 'Gift cards can be applied directly to dinner, lunch, or weekend brunches.' },
                  { Icon: CreditCard, title: 'Cellar Experience', desc: 'Apply card values to wine flights, masterclasses, or Sommelier table reservations.' },
                ].map(({ Icon, title, desc }) => (
                  <div key={title} style={{ display: 'flex', gap: '16px', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid var(--dark-border-2)' }}>
                    <div style={{ width: '36px', height: '36px', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={14} color="var(--gold)" />
                    </div>
                    <div>
                      <div style={{ color: 'var(--cream)', fontWeight: 600, fontSize: '0.84rem', marginBottom: '4px' }}>{title}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.5 }}>{desc}</div>
                    </div>
                  </div>
                ))}
                
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', lineHeight: 1.5 }}>
                  * The London Shakes digital vouchers are non-refundable and hold a validation period of twenty-four months from the checkout creation date.
                </p>
              </div>

            </div>

          </div>

        </div>
      </div>

    </div>
  );
}
