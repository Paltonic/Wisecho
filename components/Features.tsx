import React from 'react';

const featuresData = [
  {
    title: "Moral Foundation",
    subtitle: "Hinkaku-品格",
    description: "The core of our school. We cultivate students with noble character, integrity, and excellent attitude through daily habits, role modeling, and moral reflection."
  },
  {
    title: "Digital Wisdom",
    subtitle: "Chie-知恵",
    description: "Critical and ethical thinking in the digital age. Students master IT, coding, and AI responsibly, ensuring they use technology to create positive, impactful solutions."
  },
  {
    title: "Future Pathways",
    subtitle: "Mirai-未来",
    description: "Opening doors to a global future. With strong Japanese language and cultural mastery, students are ready to communicate, create, and compete internationally."
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
            <div className="flex flex-col mb-4">
              <h3 className="text-2xl font-bold uppercase tracking-wider text-white">
                {feature.title}
              </h3>
              <span className="text-[#E52B2B] text-sm tracking-widest uppercase font-semibold mt-1">
                {feature.subtitle}
              </span>
            </div>
            <p className="text-[#888888] leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}