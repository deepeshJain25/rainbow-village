// Featured reviews, one at a time. It never auto-advances, so parents read at their own pace.
import { useState } from 'react';

interface Review {
  quote: string;
  source: string;
}

export default function ReviewsSlider({ reviews }: { reviews: Review[] }) {
  const [current, setCurrent] = useState(0);
  const move = (step: number) => setCurrent((current + step + reviews.length) % reviews.length);

  return (
    <div className="rv-slider">
      <div className="rv-slider__stage" aria-live="polite">
        {reviews.map((review, index) => (
          <figure className="rv-review" key={review.quote} hidden={index !== current}>
            <blockquote>"{review.quote}"</blockquote>
            <figcaption>{review.source}</figcaption>
          </figure>
        ))}
      </div>
      <div className="rv-slider__controls">
        <button className="hs-btn" type="button" onClick={() => move(-1)}>Previous</button>
        <button className="hs-btn" type="button" onClick={() => move(1)}>Next</button>
        <span>Review {current + 1} of {reviews.length}</span>
      </div>
    </div>
  );
}
