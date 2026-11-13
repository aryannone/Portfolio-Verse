// The contact section's character: a small robot built from layers that sit at different depths.
// As it turns towards the pointer, nearer layers (eyes, visor) move further than farther ones (head, body),
// which is what makes it read as three-dimensional. lib/runtime.ts makes it look, react and talk.
// It is decoration, so it is hidden from screen readers; everything it says is also said elsewhere.
export default function ContactCharacter({ hello }: { hello: string }) {
  return (
    <div className="tp-ct-char" aria-hidden="true" data-hello={hello}>
      <div className="tp-bot-say">{hello}</div>
      <div className="tp-bot-stage">
        <div className="tp-bot-float">
          <div className="tp-bot3d">
            <span className="b-antenna">
              <i />
            </span>
            <span className="b-arm b-arm-l" />
            <span className="b-arm b-arm-r" />
            <span className="b-body">
              <span className="b-panel">
                <i />
              </span>
            </span>
            <span className="b-head">
              <span className="b-ear b-ear-l" />
              <span className="b-ear b-ear-r" />
              <span className="b-visor">
                <span className="b-eye b-eye-l" />
                <span className="b-eye b-eye-r" />
                <span className="b-mouth" />
                <span className="b-gloss" />
              </span>
            </span>
            <span className="b-confetti">
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
            </span>
          </div>
        </div>
        <span className="b-shadow" />
      </div>
    </div>
  );
}
