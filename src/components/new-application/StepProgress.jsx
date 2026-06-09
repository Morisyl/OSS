export const StepProgress = ({ currentStep, totalSteps = 3 }) => {
  return (
    <div className="flex justify-center items-center gap-3 mb-8">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div 
          key={index}
          className={`h-2.5 rounded-full transition-all duration-300 ${
            index + 1 === currentStep 
              ? 'w-8 bg-black dark:bg-white' 
              : index + 1 < currentStep 
                ? 'w-2.5 bg-gray-400 dark:bg-gray-500' 
                : 'w-2.5 bg-gray-200 dark:bg-gray-800'
          }`}
        />
      ))}
    </div>
  );
};