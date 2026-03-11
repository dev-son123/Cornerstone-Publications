"use client"

import { useState } from "react"
import { Instagram, Linkedin, MessageCircle } from "lucide-react"

const socials = [
    {
        name: "Instagram",
        href: "https://www.instagram.com/cornerstone_research_services",
        icon: <Instagram className="size-[18px]" />,
    },
    {
        name: "LinkedIn",
        href: "https://www.linkedin.com/company/cornerstone-research-and-publication-services",
        icon: <Linkedin className="size-[18px]" />,
    },
    {
        name: "WhatsApp",
        href: "https://wa.me/919962900969",
        icon: <MessageCircle className="size-[18px]" />,
    },
]

export function SocialIcons() {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

    return (
        <div className="relative inline-flex items-center gap-0.5 px-1.5 py-1.5 rounded-2xl bg-neutral-900 border border-white/[0.08]">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />

            {socials.map((social, index) => (
                <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative flex items-center justify-center w-10 h-10 rounded-xl transition-colors duration-200"
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    aria-label={social.name}
                >
                    <span
                        className={`absolute inset-1 rounded-lg bg-white/[0.08] transition-all duration-300 ease-out ${hoveredIndex === index ? "opacity-100 scale-100" : "opacity-0 scale-90"
                            }`}
                    />

                    <span
                        className={`relative z-10 transition-all duration-300 ease-out ${hoveredIndex === index ? "text-white scale-110" : "text-neutral-500"
                            }`}
                    >
                        {social.icon}
                    </span>

                    <span
                        className={`absolute bottom-1.5 left-1/2 -translate-x-1/2 h-[2px] rounded-full bg-white transition-all duration-300 ease-out ${hoveredIndex === index ? "w-3 opacity-100" : "w-0 opacity-0"
                            }`}
                    />

                    <span
                        className={`absolute -top-10 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-white text-neutral-950 text-[11px] font-medium whitespace-nowrap transition-all duration-300 ease-out ${hoveredIndex === index ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1 pointer-events-none"
                            }`}
                    >
                        {social.name}
                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-white" />
                    </span>
                </a>
            ))}
        </div>
    )
}
