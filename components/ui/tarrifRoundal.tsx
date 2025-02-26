interface TariffRoundelProps {
  cost: number;
  variant?: "default" | "small";
  margin?: string;
}

export function TariffRoundel({
  cost,
  variant = "default",
  margin = "m-2", // default margin
}: TariffRoundelProps) {
  const baseStyles =
    "flex items-center justify-center rounded-full bg-foreground/80 text-background";
  const sizeStyles =
    variant === "small" ? "w-16 h-16 text-lg p-2" : "w-20 h-20 text-base p-4";

  return (
    <div className={`${baseStyles} ${sizeStyles} ${margin} drop-shadow-xl`}>
      <div className="text-center">
        <h3 className="font-extrabold leading-1">{cost}</h3>
        <p className="text-sm -mt-1">{cost === 1 ? "Token" : "Tokens"}</p>
      </div>
    </div>
  );
}
