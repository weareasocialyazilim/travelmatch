/**
 * Global Loading Component
 * Displayed while route segments are loading
 * Uses Next.js Suspense boundary
 */
export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20">
      <div className="text-center space-y-4">
        {/* Animated Logo/Spinner */}
        <div className="relative w-16 h-16 mx-auto">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin"></div>
          {/* Inner pulse */}
          <div className="absolute inset-3 rounded-full bg-primary/10 animate-pulse"></div>
        </div>

        {/* Loading text */}
        <div className="space-y-2">
          <p className="text-lg font-medium text-foreground animate-pulse">
            Loading...
          </p>
          <p className="text-sm text-muted-foreground">
            Please wait while we prepare your content
          </p>
        </div>

        {/* Skeleton preview bars */}
        <div className="max-w-md mx-auto space-y-3 pt-4">
          <div className="h-4 bg-muted rounded animate-pulse"></div>
          <div className="h-4 bg-muted rounded w-5/6 animate-pulse"></div>
          <div className="h-4 bg-muted rounded w-4/6 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
