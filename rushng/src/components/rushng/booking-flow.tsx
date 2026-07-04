'use client';

import { useAppStore } from '@/store/app-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Footprints, Leaf, Package, Clock, WashingMachine, MapPin, CalendarDays, FileText, Plus, Trash2, CheckCircle2, ArrowRight, ArrowLeft, Weight, Timer, Send } from 'lucide-react';
import { useState } from 'react';

const serviceConfig: Record<string, { icon: React.ReactNode; title: string; color: string; fields: string[] }> = {
  shopping: { icon: <ShoppingCart className="h-5 w-5" />, title: 'Shopping Delivery', color: 'from-orange-500 to-amber-600', fields: ['pickup', 'dropoff', 'items', 'schedule', 'notes'] },
  errands: { icon: <Footprints className="h-5 w-5" />, title: 'Run Errands', color: 'from-blue-500 to-cyan-600', fields: ['pickup', 'dropoff', 'schedule', 'notes'] },
  condiments: { icon: <Leaf className="h-5 w-5" />, title: 'Condiments Shopping', color: 'from-orange-500 to-amber-600', fields: ['pickup', 'dropoff', 'items', 'schedule', 'notes'] },
  dispatch: { icon: <Package className="h-5 w-5" />, title: 'Package Dispatch', color: 'from-purple-500 to-violet-600', fields: ['pickup', 'dropoff', 'weight', 'schedule', 'notes'] },
  price_per_time: { icon: <Clock className="h-5 w-5" />, title: 'Price Per Time', color: 'from-teal-500 to-cyan-600', fields: ['pickup', 'duration', 'notes'] },
  laundry: { icon: <WashingMachine className="h-5 w-5" />, title: 'Laundry Service', color: 'from-rose-500 to-pink-600', fields: ['pickup', 'dropoff', 'schedule', 'notes'] },
};

const steps = [
  { id: 1, title: 'Pickup Details', icon: <MapPin className="h-4 w-4" /> },
  { id: 2, title: 'Delivery Info', icon: <Package className="h-4 w-4" /> },
  { id: 3, title: 'Schedule & Notes', icon: <CalendarDays className="h-4 w-4" /> },
  { id: 4, title: 'Confirm', icon: <CheckCircle2 className="h-4 w-4" /> },
];

export function BookingFlow() {
  const { selectedService, bookingForm, updateBookingForm, addBookingItem, removeBookingItem, bookingStep, setBookingStep, resetBooking, setView } = useAppStore();
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemPrice, setNewItemPrice] = useState(0);
  const [isConfirmed, setIsConfirmed] = useState(false);

  if (!selectedService) return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center"><p className="mb-4 text-lg text-muted-foreground">No service selected</p><Button onClick={() => setView('home')}>Go Home</Button></div>
    </div>
  );

  const config = serviceConfig[selectedService];
  const fields = config.fields;

  const handleAddItem = () => {
    if (newItemName.trim()) {
      addBookingItem({ name: newItemName, quantity: newItemQty, price: newItemPrice });
      setNewItemName(''); setNewItemQty(1); setNewItemPrice(0);
    }
  };

  const handleConfirm = () => { setIsConfirmed(true); setTimeout(() => { resetBooking(); setIsConfirmed(false); }, 3000); };

  const calculateTotal = () => {
    const basePrice: Record<string, number> = { shopping: 500, errands: 800, condiments: 400, dispatch: 600, price_per_time: 2000, laundry: 1000 };
    let total = basePrice[selectedService] || 500;
    if (selectedService === 'price_per_time') total = (bookingForm.duration || 1) * 2000;
    bookingForm.items.forEach((item) => { total += item.price * item.quantity; });
    return total;
  };

  return (
    <section className="py-8 md:py-12">
      <div className="container mx-auto px-4 md:px-6">
        <AnimatePresence mode="wait">
          {isConfirmed ? (
            <motion.div key="confirmed" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex min-h-[60vh] flex-col items-center justify-center gap-6">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.1 }} className="flex h-24 w-24 items-center justify-center rounded-full bg-orange-100"><CheckCircle2 className="h-12 w-12 text-orange-600" /></motion.div>
              <h2 className="text-2xl font-bold">Booking Confirmed!</h2>
              <p className="text-muted-foreground">Your {config.title} request has been placed. A rider will be assigned shortly.</p>
              <Button onClick={() => { resetBooking(); setIsConfirmed(false); }} className="gradient-rush border-0 text-white">Book Another Service</Button>
            </motion.div>
          ) : (
            <motion.div key="booking" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="mb-8 flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${config.color} text-white`}>{config.icon}</div>
                <div><h1 className="text-2xl font-bold">{config.title}</h1><p className="text-sm text-muted-foreground">Fill in the details to book your service</p></div>
              </div>
              <div className="mb-8 flex items-center justify-between overflow-x-auto rounded-xl bg-muted/50 p-2">
                {steps.map((step, idx) => (
                  <button key={step.id} onClick={() => setBookingStep(step.id)} className={`flex flex-1 items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${bookingStep === step.id ? 'bg-white text-foreground shadow-sm' : bookingStep > step.id ? 'text-orange-600' : 'text-muted-foreground'}`}>
                    {bookingStep > step.id ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs">{step.id}</span>}
                    <span className="hidden sm:inline">{step.title}</span>
                    {idx < steps.length - 1 && <div className="mx-2 hidden h-px flex-1 bg-border sm:block" />}
                  </button>
                ))}
              </div>
              <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <Card className="border-0 shadow-sm"><CardContent className="p-6">
                    <AnimatePresence mode="wait">
                      {bookingStep === 1 && (
                        <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                          <h3 className="text-lg font-semibold flex items-center gap-2"><MapPin className="h-5 w-5 text-orange-500" /> Pickup Details</h3>
                          {fields.includes('pickup') && (<div className="space-y-2"><Label htmlFor="pickup">Pickup Address</Label><div className="relative"><MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input id="pickup" placeholder="Enter pickup location" className="pl-10" value={bookingForm.pickupAddress} onChange={(e) => updateBookingForm({ pickupAddress: e.target.value })} /></div></div>)}
                          {fields.includes('dropoff') && (<div className="space-y-2"><Label htmlFor="dropoff">Dropoff Address</Label><div className="relative"><MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input id="dropoff" placeholder="Enter delivery destination" className="pl-10" value={bookingForm.dropoffAddress} onChange={(e) => updateBookingForm({ dropoffAddress: e.target.value })} /></div></div>)}
                          {fields.includes('weight') && (<div className="space-y-2"><Label htmlFor="weight">Package Weight (kg)</Label><div className="relative"><Weight className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input id="weight" type="number" placeholder="0" min="0" step="0.5" className="pl-10" value={bookingForm.weight || ''} onChange={(e) => updateBookingForm({ weight: parseFloat(e.target.value) || 0 })} /></div></div>)}
                          {fields.includes('duration') && (<div className="space-y-2"><Label htmlFor="duration">Duration (hours)</Label><div className="relative"><Timer className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input id="duration" type="number" placeholder="1" min="1" className="pl-10" value={bookingForm.duration || ''} onChange={(e) => updateBookingForm({ duration: parseInt(e.target.value) || 1 })} /></div><p className="text-xs text-muted-foreground">Minimum 1 hour. Charged at &#8358;2,000 per hour.</p></div>)}
                        </motion.div>
                      )}
                      {bookingStep === 2 && (
                        <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                          <h3 className="text-lg font-semibold flex items-center gap-2"><Package className="h-5 w-5 text-orange-500" /> Items & Details</h3>
                          {fields.includes('items') && (
                            <div className="space-y-4">
                              <Label>Add Items to Purchase</Label>
                              <div className="grid gap-3 sm:grid-cols-3">
                                <Input placeholder="Item name" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} />
                                <Input type="number" placeholder="Qty" min="1" value={newItemQty} onChange={(e) => setNewItemQty(parseInt(e.target.value) || 1)} />
                                <div className="flex gap-2"><Input type="number" placeholder="Price &#8358;" min="0" value={newItemPrice || ''} onChange={(e) => setNewItemPrice(parseFloat(e.target.value) || 0)} /><Button size="icon" variant="outline" onClick={handleAddItem}><Plus className="h-4 w-4" /></Button></div>
                              </div>
                              {bookingForm.items.length > 0 && (
                                <div className="space-y-2 rounded-lg border p-4">
                                  {bookingForm.items.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between rounded-md bg-muted/50 p-2">
                                      <div><p className="text-sm font-medium">{item.name}</p><p className="text-xs text-muted-foreground">Qty: {item.quantity} x &#8358;{item.price}</p></div>
                                      <div className="flex items-center gap-3"><span className="text-sm font-semibold">&#8358;{item.quantity * item.price}</span><Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => removeBookingItem(idx)}><Trash2 className="h-3.5 w-3.5" /></Button></div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                          {selectedService === 'dispatch' && (<div className="rounded-lg border border-dashed border-orange-300 bg-orange-50/50 p-6 text-center"><Package className="mx-auto mb-3 h-10 w-10 text-orange-500" /><h4 className="mb-1 font-semibold">Package Information</h4><p className="text-sm text-muted-foreground">Ensure your package is properly sealed and labeled. Maximum weight per dispatch is 50kg.</p></div>)}
                          {selectedService === 'laundry' && (<div className="space-y-3"><Label>Service Type</Label><Select><SelectTrigger><SelectValue placeholder="Select wash type" /></SelectTrigger><SelectContent><SelectItem value="wash-fold">Wash & Fold</SelectItem><SelectItem value="wash-iron">Wash & Iron</SelectItem><SelectItem value="dry-clean">Dry Clean</SelectItem><SelectItem value="iron-only">Iron Only</SelectItem></SelectContent></Select></div>)}
                          {selectedService === 'errands' && (<div className="space-y-3"><Label>Errand Type</Label><Select><SelectTrigger><SelectValue placeholder="What do you need done?" /></SelectTrigger><SelectContent><SelectItem value="document-pickup">Document Pickup</SelectItem><SelectItem value="bill-payment">Bill Payment</SelectItem><SelectItem value="queue-service">Queue for Service</SelectItem><SelectItem value="food-pickup">Food Pickup</SelectItem><SelectItem value="custom">Custom Errand</SelectItem></SelectContent></Select></div>)}
                        </motion.div>
                      )}
                      {bookingStep === 3 && (
                        <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                          <h3 className="text-lg font-semibold flex items-center gap-2"><CalendarDays className="h-5 w-5 text-orange-500" /> Schedule & Notes</h3>
                          {fields.includes('schedule') && (<div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="date">Preferred Date</Label><Input id="date" type="date" value={bookingForm.scheduledDate} onChange={(e) => updateBookingForm({ scheduledDate: e.target.value })} /></div><div className="space-y-2"><Label htmlFor="time">Preferred Time</Label><Input id="time" type="time" value={bookingForm.scheduledTime} onChange={(e) => updateBookingForm({ scheduledTime: e.target.value })} /></div></div>)}
                          <div className="space-y-2"><Label htmlFor="notes">Special Instructions</Label><Textarea id="notes" placeholder="Any special instructions for the rider..." rows={4} value={bookingForm.notes} onChange={(e) => updateBookingForm({ notes: e.target.value })} /></div>
                        </motion.div>
                      )}
                      {bookingStep === 4 && (
                        <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                          <h3 className="text-lg font-semibold flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-orange-500" /> Confirm Booking</h3>
                          <div className="space-y-4 rounded-lg border bg-muted/30 p-6">
                            <div className="flex items-center gap-3"><div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${config.color} text-white`}>{config.icon}</div><div><p className="font-semibold">{config.title}</p><p className="text-sm text-muted-foreground">{selectedService === 'price_per_time' ? `${bookingForm.duration} hour(s)` : 'Standard delivery'}</p></div></div>
                            <Separator />
                            {bookingForm.pickupAddress && (<div className="flex gap-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" /><div><p className="text-xs text-muted-foreground">Pickup</p><p className="text-sm font-medium">{bookingForm.pickupAddress}</p></div></div>)}
                            {bookingForm.dropoffAddress && (<div className="flex gap-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-red-500" /><div><p className="text-xs text-muted-foreground">Dropoff</p><p className="text-sm font-medium">{bookingForm.dropoffAddress}</p></div></div>)}
                            {bookingForm.scheduledDate && (<div className="flex gap-3"><CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" /><div><p className="text-xs text-muted-foreground">Schedule</p><p className="text-sm font-medium">{bookingForm.scheduledDate}{bookingForm.scheduledTime && ` at ${bookingForm.scheduledTime}`}</p></div></div>)}
                            {bookingForm.notes && (<div className="flex gap-3"><FileText className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" /><div><p className="text-xs text-muted-foreground">Notes</p><p className="text-sm">{bookingForm.notes}</p></div></div>)}
                            {bookingForm.items.length > 0 && (<div><p className="mb-2 text-sm font-medium">Items ({bookingForm.items.length})</p>{bookingForm.items.map((item, idx) => (<div key={idx} className="flex justify-between border-b border-border/50 py-1.5 last:border-0"><span className="text-sm">{item.name} x{item.quantity}</span><span className="text-sm font-medium">&#8358;{item.quantity * item.price}</span></div>))}</div>)}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <div className="mt-8 flex justify-between">
                      <Button variant="outline" onClick={() => bookingStep > 1 && setBookingStep(bookingStep - 1)} disabled={bookingStep === 1} className="gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button>
                      {bookingStep < 4 ? (<Button onClick={() => setBookingStep(bookingStep + 1)} className="gap-2 gradient-rush border-0 text-white">Continue <ArrowRight className="h-4 w-4" /></Button>) : (<Button onClick={handleConfirm} className="gap-2 gradient-rush border-0 text-white"><Send className="h-4 w-4" /> Confirm Booking</Button>)}
                    </div>
                  </CardContent></Card>
                </div>
                <div className="space-y-4">
                  <Card className="border-0 shadow-sm"><CardHeader className="pb-3"><CardTitle className="text-base">Price Summary</CardTitle></CardHeader><CardContent className="space-y-3">
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Base fare</span><span className="font-medium">{selectedService === 'price_per_time' ? `&#8358;2,000 x ${bookingForm.duration || 1}hr(s)` : '&#8358;' + ({ shopping: '500', errands: '800', condiments: '400', dispatch: '600', laundry: '1,000' }[selectedService] || '500')}</span></div>
                    {bookingForm.items.length > 0 && (<div className="flex justify-between text-sm"><span className="text-muted-foreground">Items cost</span><span className="font-medium">&#8358;{bookingForm.items.reduce((sum, item) => sum + item.price * item.quantity, 0)}</span></div>)}
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Service fee</span><span className="font-medium">&#8358;50</span></div>
                    <Separator />
                    <div className="flex justify-between font-bold"><span>Total</span><span className="gradient-text">&#8358;{calculateTotal().toLocaleString()}</span></div>
                    <p className="text-xs text-muted-foreground">* Final price may vary based on distance and demand</p>
                  </CardContent></Card>
                  <Card className="border-0 bg-orange-50 shadow-sm"><CardContent className="p-4"><div className="flex gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100"><CheckCircle2 className="h-5 w-5 text-orange-600" /></div><div><p className="text-sm font-semibold text-orange-800">Buyer Fee is Minimal</p><p className="text-xs text-orange-700">Sellers pay for advertising. Your fee is almost nothing!</p></div></div></CardContent></Card>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}