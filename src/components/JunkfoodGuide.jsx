import BackButton from './BackButton'

const referenceTable = [
  { food: 'Spicy McChicken', score: '1.0', reason: 'The reference point' },
  { food: 'Bag of chips (single serve)', score: '1.0', reason: '1 serving salty snack' },
  { food: 'Can of soda (39g sugar)', score: '3.9', reason: '39g x 0.1' },
  { food: 'Candy bar (e.g. Snickers)', score: '2.5', reason: '~25g sugar' },
  { food: 'Slice of pizza', score: '0.8', reason: 'Less processed than McChicken' },
  { food: 'Donut', score: '2.0', reason: '~20g sugar + fried' },
  { food: 'Handful of gummy bears', score: '1.5', reason: '~15g sugar' },
  { food: 'Bowl of ice cream', score: '2.5', reason: '~25g sugar + fat' },
  { food: 'French fries (medium)', score: '1.2', reason: 'Fried, salty, ~McChicken level' },
  { food: 'Energy drink', score: '2.7', reason: '~27g sugar + stimulants' },
]

export default function JunkfoodGuide({ onBack, onContinue, isModal = false }) {
  const content = (
    <div className={isModal ? '' : 'min-h-screen bg-warm-50 flex flex-col items-center p-6 pt-16'}>
      {!isModal && onBack && <BackButton onClick={onBack} />}
      <div className="max-w-md w-full">
        {isModal && (
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-warm-900">Scoring guide</h2>
            <button onClick={onBack} className="text-warm-400 hover:text-warm-600 text-2xl leading-none">&times;</button>
          </div>
        )}

        {!isModal && (
          <>
            <h2 className="text-2xl font-bold text-warm-900 mb-2">
              How to score your junk food
            </h2>
            <p className="text-warm-500 mb-6">
              Give each food a "junkfood number" so your tracking stays consistent. Here's how:
            </p>
          </>
        )}

        {/* The 3 rules */}
        <div className="space-y-3 mb-6">
          <div className="bg-white rounded-2xl p-4 border border-warm-100">
            <p className="font-semibold text-warm-900 mb-1">Rule 1: Sugar</p>
            <p className="text-sm text-warm-600">
              1g of sugar = 0.1 junkfoods. A can of soda with 39g sugar = 3.9 junkfoods.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-warm-100">
            <p className="font-semibold text-warm-900 mb-1">Rule 2: Salty snacks</p>
            <p className="text-sm text-warm-600">
              1 serving of any salty snack (chips, pretzels, etc.) = 1 junkfood.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-warm-100">
            <p className="font-semibold text-warm-900 mb-1">Rule 3: Everything else</p>
            <p className="text-sm text-warm-600">
              Use a Spicy McChicken as your reference (= 1 junkfood). Ask yourself: "Is this more or less junky than a Spicy McChicken?" and score accordingly.
            </p>
          </div>
        </div>

        {/* What counts as junk food */}
        <div className="bg-warm-100/50 rounded-2xl p-4 mb-6">
          <p className="font-medium text-warm-700 text-sm mb-2">What counts as "junk food"?</p>
          <p className="text-sm text-warm-500">
            Foods with high amounts of added sugar, unhealthy fats, sodium, or highly processed ingredients that science shows are harmful in excess. If it has stuff in it that isn't good for you, give it a junkfood number based on how much "bad stuff" it contains relative to a Spicy McChicken.
          </p>
        </div>

        {/* Reference table */}
        <p className="text-sm text-warm-400 uppercase tracking-wider mb-2">Quick reference</p>
        <div className="bg-white rounded-2xl border border-warm-100 overflow-hidden mb-6">
          {referenceTable.map((item, i) => (
            <div
              key={item.food}
              className={`flex items-center justify-between px-4 py-2.5 text-sm ${
                i !== referenceTable.length - 1 ? 'border-b border-warm-50' : ''
              } ${i === 0 ? 'bg-sage-50' : ''}`}
            >
              <span className={`text-warm-700 ${i === 0 ? 'font-semibold' : ''}`}>{item.food}</span>
              <span className="font-mono font-semibold text-warm-900 ml-3">{item.score}</span>
            </div>
          ))}
        </div>

        <div className="bg-warm-100/50 rounded-2xl p-4 mb-8">
          <p className="font-medium text-warm-700 text-sm mb-1">Pro tip</p>
          <p className="text-sm text-warm-500">
            Score your go-to foods once and remember those numbers. That way your daily tracking is fast and consistent. You don't need to be exact — just consistent with yourself.
          </p>
        </div>

        {!isModal && onContinue && (
          <button
            onClick={onContinue}
            className="w-full bg-sage-500 text-white py-3.5 px-6 rounded-2xl font-medium text-lg hover:bg-sage-600 transition-colors shadow-lg shadow-sage-500/20"
          >
            Got it, let's go
          </button>
        )}
      </div>
    </div>
  )

  if (isModal) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
        <div className="bg-warm-50 rounded-3xl p-6 max-w-md w-full max-h-[85vh] overflow-y-auto shadow-xl">
          {content}
        </div>
      </div>
    )
  }

  return content
}
