import { useState, type CSSProperties } from 'react'

type Skill = {
  name: string
  icon: string
  color: string
}

const coreSkills: Skill[] = [
  { name: 'HTML', icon: '/skills/html5.svg', color: '#E34F26' },
  { name: 'CSS', icon: '/skills/css.svg', color: '#663399' },
  { name: 'JavaScript', icon: '/skills/javascript.svg', color: '#F7DF1E' },
  { name: 'TypeScript', icon: '/skills/typescript.svg', color: '#3178C6' },
  { name: 'React', icon: '/skills/react.svg', color: '#61DAFB' },
  { name: 'Tailwind CSS', icon: '/skills/tailwindcss.svg', color: '#06B6D4' },
  { name: 'Vite', icon: '/skills/vite.svg', color: '#A78BFA' },
  { name: 'Node.js', icon: '/skills/nodedotjs.svg', color: '#5FA04E' },
  { name: 'Express', icon: '/skills/express.svg', color: '#A8B1C2' },
  { name: 'MongoDB', icon: '/skills/mongodb.svg', color: '#47A248' },
  { name: 'Mongoose', icon: '/skills/mongoose.svg', color: '#B65A68' },
  { name: 'Vitest', icon: '/skills/vitest.svg', color: '#729B1B' },
  { name: 'Git', icon: '/skills/git.svg', color: '#F05032' },
  { name: 'GitHub', icon: '/skills/github.svg', color: '#9AA4B7' },
  { name: 'Vercel', icon: '/skills/vercel.svg', color: '#9AA4B7' },
  { name: 'Netlify', icon: '/skills/netlify.svg', color: '#00C7B7' },
]

const supportingSkills = ['REST APIs', 'Authentication', 'Supertest', 'Accessibility']

type SkillStyle = CSSProperties & {
  '--skill-icon': string
  '--skill-color': string
}

function SkillLoop({ duplicate = false }: { duplicate?: boolean }) {
  return (
    <ul className="skill-loop" aria-hidden={duplicate || undefined}>
      {coreSkills.map((skill) => (
        <li className="skill-chip" key={`${duplicate ? 'duplicate-' : ''}${skill.name}`}>
          <span
            className="skill-logo"
            style={{
              '--skill-icon': `url("${skill.icon}")`,
              '--skill-color': skill.color,
            } as SkillStyle}
            aria-hidden="true"
          />
          <span>{skill.name}</span>
        </li>
      ))}
    </ul>
  )
}

export function SkillsCarousel() {
  const [paused, setPaused] = useState(false)

  return (
    <div className="skills-carousel">
      <div className="skills-carousel-heading">
        <p>Core toolkit</p>
        <button
          className="skills-carousel-toggle"
          type="button"
          aria-pressed={paused}
          onClick={() => setPaused((current) => !current)}
        >
          <span aria-hidden="true">{paused ? '▶' : 'Ⅱ'}</span>
          {paused ? 'Play motion' : 'Pause motion'}
        </button>
      </div>

      <div className="skills-carousel-window" role="region" aria-label="Core technologies" tabIndex={0}>
        <div className={`skills-carousel-track${paused ? ' is-paused' : ''}`}>
          <SkillLoop />
          <SkillLoop duplicate />
        </div>
      </div>

      <p className="supporting-skills">
        <span>Beyond the logos:</span>
        <strong>{supportingSkills.join(' · ')}</strong>
      </p>
    </div>
  )
}
