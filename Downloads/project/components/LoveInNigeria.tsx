import { DollarSign, Heart, Shield } from 'lucide-react'

interface MessagePointProps {
  number: number
  content: string
  isHighlight?: boolean
}

function MessagePoint({ number, content, isHighlight = false }: MessagePointProps) {
  return (
    <div className={`${isHighlight ? 'bg-red-50 border-red-200' : 'bg-white'} rounded-lg p-6 shadow-lg border-l-4 ${isHighlight ? 'border-red-500' : 'border-green-500'}`}>
      <div className="flex items-start">
        <div className={`w-8 h-8 ${isHighlight ? 'bg-red-600' : 'bg-green-600'} text-white rounded-full flex items-center justify-center text-sm font-semibold mr-4 flex-shrink-0 mt-1`}>
          {number}
        </div>
        <p className="text-gray-700 leading-relaxed">{content}</p>
      </div>
    </div>
  )
}

export default function LoveInNigeria() {
  const loveMessages = [
    { content: "We do not Love ourselves in Nigeria.", isHighlight: true },
    { content: "To make this worst as stated in (1) above WE ARE STUBBORN IN WICKEDNESS.", isHighlight: true },
    { content: "All families in Nigeria are guilty including my own and your own families.", isHighlight: true },
    { content: "Why? Because Money and Materialism is the language of Love in our homes and families.", isHighlight: true },
    { content: "Love of money is the root of all evils, name any evil you find it in Nigeria.", isHighlight: true },
    { content: "There is a thin line between LOVE of God and LOVE of money; you need to work hard DAILY to be on the side of God, because LOVE of God is the root of all blessings while LOVE of money is the root of all evils.", isHighlight: false },
    { content: "For God so loved the world... (John 3:16). But take note this includes every human being on this planet NO EXCEPTION.", isHighlight: false },
    { content: "The idea of HUSBAND AND WIFE AND FAMILY is from God and God alone.", isHighlight: false },
    { content: "God's Love languages is in the yellow card in your hand.", isHighlight: false },
    { content: "Any family who memorize and practicalized the characteristics of Love in his or her family IT IS MANDATORY OR COMPULSORY FOR GOD TO BLESS THAT FAMILY.", isHighlight: false }
  ]

  return (
    <section id="love-nigeria" className="py-20 px-6 bg-gradient-to-b from-red-50 to-green-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif text-green-800 mb-6">
            Love Ministry for Nigeria and Nigerians
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
            A direct message about the state of love in Nigeria and the path to transformation through practical love.
          </p>
        </div>

        {/* Notable Nigerians Section */}
        <div className="mb-16 bg-white rounded-2xl p-8 shadow-lg">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-serif text-gray-800 mb-4">Examples from Nigerian Leadership</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-3">Mrs. Ngozi Okonjo-Iweala</h4>
              <p className="text-gray-700">
                Former Finance Minister and current WTO Director-General, whose family background traces to loving and godly roots that honor God.
              </p>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <h4 className="font-semibold text-purple-800 mb-3">Mr. Adesina Akinwunmi</h4>
              <p className="text-gray-700">
                President of African Development Bank (AfDB), whose background demonstrates the impact of loving and God-fearing families.
              </p>
            </div>
          </div>
          <div className="mt-6 p-4 bg-yellow-100 rounded-lg">
            <p className="text-yellow-800 font-medium text-center">
              "Those who honor me I will honor them" - God's promise to families who practice practical love
            </p>
          </div>
        </div>

        {/* Summary Message */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-serif text-red-800 mb-4">
              Summary of Love Message in "Love Ministry"
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loveMessages.map((message, index) => (
              <MessagePoint
                key={index}
                number={index + 1}
                content={message.content}
                isHighlight={message.isHighlight}
              />
            ))}
          </div>
        </div>

        {/* Key Principles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-8 rounded-xl shadow-lg text-center">
            <DollarSign className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h4 className="text-xl font-semibold text-gray-800 mb-3">The Problem</h4>
            <p className="text-gray-600">Money and materialism have become the language of love in Nigerian homes</p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-lg text-center">
            <Heart className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h4 className="text-xl font-semibold text-gray-800 mb-3">The Solution</h4>
            <p className="text-gray-600">Replace money-love with God's love using the characteristics in the yellow card</p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-lg text-center">
            <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h4 className="text-xl font-semibold text-gray-800 mb-3">The Promise</h4>
            <p className="text-gray-600">God is compulsory to bless families who memorize and practice these love characteristics</p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-12 text-white text-center">
          <h3 className="text-3xl font-serif mb-4">Transform Your Family Today</h3>
          <p className="text-green-100 mb-8 max-w-2xl mx-auto">
            If you love your wife and/or wife loves your husband, parents love their children and children love your parents - 
            based on the LANGUAGE OF LOVE IN THE YELLOW CARD - you are honoring God, and God says those who honor Him will be honored.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-green-600 px-8 py-3 rounded-lg font-medium hover:bg-green-50 transition-colors">
              Get Your Yellow Card
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-green-600 transition-colors">
              Start Practicing Love
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}