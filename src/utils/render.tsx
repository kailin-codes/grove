import { StarIcon } from "@heroicons/react/24/solid";

export const renderStars = (rate: number, totalReviews?: number) => {
  const stars = [];
  const roundedRate = Math.round(rate * 2) / 2; // Round to nearest 0.5

  for (let i = 1; i <= 5; i++) {
    if (i <= roundedRate) {
      stars.push(
        <StarIcon
          key={i}
          className="h-4 stroke-orange-400 stroke-2 text-primary"
        />
      );
    } else if (i === Math.ceil(roundedRate) && !Number.isInteger(roundedRate)) {
      stars.push(
        <StarIcon
          key={i}
          className="h-4 stroke-orange-400 stroke-2 text-primary"
        />
      );
    } else {
      stars.push(
        <StarIcon
          key={i}
          className="h-4 stroke-orange-400 stroke-2 text-white"
        />
      );
    }
  }

  return (
    <div className="flex items-center">
      <div className="flex">{stars}</div>
      <span className="ml-2 text-sm text-gray-600">
        {rate.toFixed(1)} {totalReviews !== undefined && `(${totalReviews})`}
      </span>
    </div>
  );
};