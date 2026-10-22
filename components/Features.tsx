const featuresData = [
  {
    title: "Sharp Focus",
    description: "We cut through the noise. Our strategies are direct, angular, and built to pierce through market clutter with absolute clarity."
  },
  {
    title: "Resonating Impact",
    description: "Like an echo, our solutions are designed to carry your message further, creating a lasting impact that reverberates across your industry."
  },
  {
    title: "Geometric Precision",
    description: "Every element is placed with purpose. We combine modern aesthetics with structural integrity to build brands that stand the test of time."
  }
];

export default function Features() {
  return (
    <section className="py-20 px-8 md:px-[5%] bg-[#151515]">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {featuresData.map((feature, index) => (
          <div 
            key={index} 
            className="bg-[#242424] p-10 border-t-4 border-[#E52B2B] hover:-translate-y-2 transition-transform duration-300"
          >
            <h3 className="text-2xl font-bold uppercase tracking-wider mb-4 text-white">
              {feature.title}
            </h3>
            <p className="text-[#888888] leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}