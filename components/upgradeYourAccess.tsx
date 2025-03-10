'use client'

import { Button } from '@/components/ui/button'

interface UpgradeYourAccessProps {
  redirectToSubscribe: () => void
  placeholderCount?: number
}

export default function UpgradeYourAccess({
  redirectToSubscribe,
  placeholderCount = 5,
}: UpgradeYourAccessProps) {
  // This function renders empty placeholder cards
  const renderPlaceholderCards = (count: number) => {
    return Array.from({ length: count }).map((_, index) => (
      <div
        key={`placeholder-${index}`}
        className="rounded-lg border-dashed border-8 border-muted-foreground/30 h-[188px] w-full mb-8"
      />
    ))
  }

  return (
    <div>
      <div className="bg-card rounded-lg border-2 border-primary p-8 shadow-sm my-8">
        <h2 className="text-2xl font-semibold mb-4">Upgrade your access</h2>
        <p className="text-foreground mb-6">
          Generate your service journey for free above. To access advanced
          features like personas, customer and business pain point generation,
          and service feature generation, you will need to subscribe to a paid
          plan.
        </p>
        <Button onClick={redirectToSubscribe} className="px-6">
          Subscribe Now
        </Button>
      </div>
      {renderPlaceholderCards(placeholderCount)}
    </div>
  )
}
