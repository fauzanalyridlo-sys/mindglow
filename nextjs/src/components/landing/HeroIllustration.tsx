export default function HeroIllustration() {
  return (
    <svg
      className="hero-illustration"
      viewBox="0 0 600 470"
      role="img"
      aria-label="Tiga mahasiswa saling mendukung"
    >
      <path
        className="illustration-blob"
        d="M463 38c73 33 111 119 90 204-22 89-104 160-203 171-90 10-185-32-209-112-24-81 26-157 92-209 66-51 155-88 230-54Z"
      />

      <g className="illustration-line">
        <path d="M171 165c33-62 81-94 144-106M409 72c48 31 74 78 78 140" />
        <path d="m198 115-35-20M418 112l28-35M298 52l-6-37" />
        <path d="M138 254c-25-9-47-7-67 6M487 272c31 6 51 20 61 41" />
      </g>

      <g className="person-one">
        <circle cx="211" cy="139" r="25" />
        <path
          className="hair"
          d="M188 138c3-31 42-38 50-9-15 1-26-4-31-14-1 10-7 18-19 23Z"
        />
        <path className="skin" d="m205 157-4 24 30 2-10-27" />
        <path className="shirt" d="M190 176c19-9 37-8 55 2l17 91-74 4Z" />
        <path d="m192 187-54 69 16 11 55-47M240 185l42 55" />
        <path
          className="pants"
          d="m194 267 4 104 22 1 13-78 23 71 23-4-17-97Z"
        />
        <path d="m198 371-18 39M220 372l-4 40M279 361l18 34" />
      </g>

      <g className="person-two">
        <circle className="skin" cx="340" cy="146" r="24" />
        <path
          className="hair"
          d="M317 145c-1-31 38-40 48-13-16 3-27-2-34-11 0 11-5 19-14 24Z"
        />
        <path className="skin" d="m330 164-4 24 29 3-9-28" />
        <path
          className="shirt shirt--pink"
          d="M313 186c21-11 43-9 59 4l12 83-75 3Z"
        />
        <path d="m318 198-39 41 15 13 37-25M369 198l48-54" />
        <path
          className="pants"
          d="m317 271 20 98 22-2 4-75 26 66 22-8-29-82Z"
        />
        <path d="m337 369-6 41M359 367l11 40M411 350l25 31" />
      </g>

      <g className="person-three">
        <circle className="skin" cx="457" cy="150" r="24" />
        <path className="hair" d="M431 149c0-35 43-44 53-11l-4 47-48-1Z" />
        <path className="skin" d="m447 168-4 22 28 2-9-25" />
        <path
          className="shirt shirt--blue"
          d="M427 188c22-10 43-8 59 5l4 86-75-1Z"
        />
        <path d="m430 198-27 62 17 7 29-41M482 202l28 66" />
        <path className="skirt" d="m419 272-9 65 82 1-10-68Z" />
        <path d="m430 337 2 70M471 338l25 59" />
      </g>

      <g className="illustration-accent">
        <path d="M129 161c17 4 27 15 30 32M119 176c15 1 24 7 28 19" />
        <path d="M511 182c18-4 31 1 39 14M513 199c12-3 21 0 27 8" />
        <path d="M252 93c5-17 16-27 31-31M368 83c7-14 18-21 33-22" />
      </g>
    </svg>
  )
}