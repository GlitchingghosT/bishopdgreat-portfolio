import { Reveal } from './Reveal'

const hobbies = ['meditate', 'brainstorm', 'code', 'game', 'eat', 'sleep', 'repeat-ish']

const favouriteTracks = [
  { title: 'Higher Powers', artist: 'Wizard Chan' },
  { title: 'Speak to Me', artist: 'Iniko' },
]

export function PersonalSection() {
  return (
    <section className="personal-section section" id="off-duty" aria-labelledby="personal-title">
      <div className="personal-circuit" aria-hidden="true" />
      <div className="shell personal-shell">
        <div className="personal-stage">
          <Reveal className="personal-story" variant="slide-left">
            <p className="mono-label"><span>04</span>Off duty</p>
            <h2 id="personal-title">Outside the commit history.</h2>
            <p className="personal-hello">Wagwan, you found me.</p>
            <div className="personal-copy">
              <p>
                I&apos;m Nwachinemere Emmanuel, though around these parts I&apos;m widely known as{' '}
                <code>{'<Lord> Bishop </DGreat>'}</code>. Welcome to my little corner of the internet,
                or my <em>Digital Space</em> if we&apos;re being slightly dramatic.
              </p>
              <p>
                By day, I&apos;m a Full-Stack Developer. I design smooth, responsive interfaces and write
                the server logic that keeps everything from falling apart when someone clicks the wrong button.
              </p>
              <p>
                By night, I become a research guy. One question turns into twelve open tabs, three articles,
                a random documentary, and another topic I suddenly <em>need</em> to understand.
              </p>
              <p>
                I enjoy gathering information, questioning what I already know, and expanding my view of tech
                and the world around me. Sometimes that curiosity becomes code. Sometimes it becomes notes.
                Sometimes it just becomes an unreasonable number of browser tabs.
              </p>
            </div>
          </Reveal>

          <div className="personal-scrapbook" aria-label="A few things about Emmanuel outside work">
            <Reveal className="personal-note-wrap personal-note-wrap-loop" delay={60} variant="tilt">
              <article className="personal-note personal-note-loop">
                <p className="note-label">the off-duty loop</p>
                <div className="hobby-loop" aria-label={hobbies.join(', ')}>
                  {hobbies.map((hobby, index) => (
                    <span key={hobby}>
                      {hobby}
                      {index < hobbies.length - 1 && <b aria-hidden="true">→</b>}
                    </span>
                  ))}
                </div>
              </article>
            </Reveal>

            <Reveal className="personal-note-wrap personal-note-wrap-games" delay={110} variant="slide-right">
              <article className="personal-note personal-note-games">
                <p className="note-label">choose your opponent</p>
                <p><strong>Chess</strong> when I feel strategic.</p>
                <p><strong>CODM</strong> when strategy needs a little more chaos.</p>
                <p><strong>Lawn tennis</strong> when it&apos;s time to remember that outside exists.</p>
              </article>
            </Reveal>

            <Reveal className="personal-note-wrap personal-note-wrap-music" delay={160} variant="scale">
              <article className="personal-note personal-note-music">
                <p className="note-label">currently in rotation</p>
                <ul>
                  {favouriteTracks.map((track, index) => (
                    <li key={track.title}>
                      <span aria-hidden="true">side {index === 0 ? 'A' : 'B'}</span>
                      <div><strong>{track.title}</strong><small>{track.artist}</small></div>
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>

            <Reveal className="personal-note-wrap personal-note-wrap-movies" delay={210} variant="tilt">
              <article className="personal-note personal-note-movies">
                <p className="note-label">movie night?</p>
                <p><strong>Sci-fi</strong> for future tech. <strong>Action</strong> for things exploding. <strong>Comedy</strong> when being serious has done enough for the day.</p>
              </article>
            </Reveal>
          </div>
        </div>

        <Reveal className="personal-belief" delay={120} variant="focus">
          <p className="note-label">what keeps me grounded</p>
          <blockquote>
            I believe there&apos;s a Creator. I&apos;m big on finding balance too. The mind needs regular calibration
            and, every now and then, a little liberation from whatever has been sitting there rent-free.
          </blockquote>
          <p className="personal-signoff">
            Builder by profession. Researcher by curiosity. Gamer when the lobby behaves. Occasional victim of
            “just one more article.”
          </p>
        </Reveal>
      </div>
    </section>
  )
}
