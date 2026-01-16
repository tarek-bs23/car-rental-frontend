import { PremiumLoader, SpinnerLoader, DotsLoader, PulseLoader } from './PremiumLoader';

/**
 * This file demonstrates all available loader components and their usage
 * Use these loaders throughout the app for consistent loading states
 */

export function LoaderExamples() {
  return (
    <div className="min-h-screen bg-gray-50 p-8 space-y-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Premium Loader Components
        </h1>

        {/* PremiumLoader */}
        <section className="bg-white rounded-xl p-8 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              PremiumLoader (Default)
            </h2>
            <p className="text-gray-600 mb-4">
              The main premium loader with animated rings and optional text
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="text-center space-y-3">
              <p className="text-sm text-gray-600">Small</p>
              <div className="h-24 flex items-center justify-center">
                <PremiumLoader size="sm" />
              </div>
            </div>
            <div className="text-center space-y-3">
              <p className="text-sm text-gray-600">Medium</p>
              <div className="h-24 flex items-center justify-center">
                <PremiumLoader size="md" />
              </div>
            </div>
            <div className="text-center space-y-3">
              <p className="text-sm text-gray-600">Large</p>
              <div className="h-24 flex items-center justify-center">
                <PremiumLoader size="lg" />
              </div>
            </div>
          </div>

          <div className="text-center space-y-3">
            <p className="text-sm text-gray-600">With Text</p>
            <div className="h-32 flex items-center justify-center">
              <PremiumLoader size="md" text="Loading your data..." />
            </div>
          </div>

          <div className="bg-gray-100 rounded p-4">
            <p className="text-sm font-mono text-gray-700">
              {`<PremiumLoader size="md" text="Loading..." />`}
            </p>
            <p className="text-sm font-mono text-gray-700 mt-2">
              {`<PremiumLoader fullScreen size="lg" text="Processing..." />`}
            </p>
          </div>
        </section>

        {/* SpinnerLoader */}
        <section className="bg-white rounded-xl p-8 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              SpinnerLoader
            </h2>
            <p className="text-gray-600 mb-4">
              Simple spinning loader for inline use
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="text-center space-y-3">
              <p className="text-sm text-gray-600">Small</p>
              <div className="h-16 flex items-center justify-center">
                <SpinnerLoader size="sm" />
              </div>
            </div>
            <div className="text-center space-y-3">
              <p className="text-sm text-gray-600">Medium</p>
              <div className="h-16 flex items-center justify-center">
                <SpinnerLoader size="md" />
              </div>
            </div>
            <div className="text-center space-y-3">
              <p className="text-sm text-gray-600">Large</p>
              <div className="h-16 flex items-center justify-center">
                <SpinnerLoader size="lg" />
              </div>
            </div>
          </div>

          <div className="bg-gray-100 rounded p-4">
            <p className="text-sm font-mono text-gray-700">
              {`<SpinnerLoader size="md" />`}
            </p>
          </div>
        </section>

        {/* DotsLoader */}
        <section className="bg-white rounded-xl p-8 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              DotsLoader
            </h2>
            <p className="text-gray-600 mb-4">
              Three animated dots for subtle loading indication
            </p>
          </div>

          <div className="h-16 flex items-center justify-center">
            <DotsLoader />
          </div>

          <div className="bg-gray-100 rounded p-4">
            <p className="text-sm font-mono text-gray-700">
              {`<DotsLoader />`}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Great for inline loading states, like "Loading<DotsLoader />"
            </p>
          </div>
        </section>

        {/* PulseLoader */}
        <section className="bg-white rounded-xl p-8 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              PulseLoader
            </h2>
            <p className="text-gray-600 mb-4">
              Pulsing circular loader with wave effect
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="text-center space-y-3">
              <p className="text-sm text-gray-600">Small</p>
              <div className="h-24 flex items-center justify-center">
                <PulseLoader size="sm" />
              </div>
            </div>
            <div className="text-center space-y-3">
              <p className="text-sm text-gray-600">Medium</p>
              <div className="h-24 flex items-center justify-center">
                <PulseLoader size="md" />
              </div>
            </div>
            <div className="text-center space-y-3">
              <p className="text-sm text-gray-600">Large</p>
              <div className="h-24 flex items-center justify-center">
                <PulseLoader size="lg" />
              </div>
            </div>
          </div>

          <div className="bg-gray-100 rounded p-4">
            <p className="text-sm font-mono text-gray-700">
              {`<PulseLoader size="md" />`}
            </p>
          </div>
        </section>

        {/* Usage Examples */}
        <section className="bg-blue-50 rounded-xl p-8 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Usage Examples
            </h2>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded p-4">
              <p className="text-sm font-semibold text-gray-900 mb-2">
                Full Screen Loading
              </p>
              <p className="text-sm font-mono text-gray-700 bg-gray-50 p-3 rounded">
                {`<PremiumLoader fullScreen size="lg" text="Processing payment..." />`}
              </p>
            </div>

            <div className="bg-white rounded p-4">
              <p className="text-sm font-semibold text-gray-900 mb-2">
                Inline Button Loading
              </p>
              <p className="text-sm font-mono text-gray-700 bg-gray-50 p-3 rounded">
                {`<Button disabled={loading}>
  {loading ? <SpinnerLoader size="sm" /> : "Submit"}
</Button>`}
              </p>
            </div>

            <div className="bg-white rounded p-4">
              <p className="text-sm font-semibold text-gray-900 mb-2">
                Card Loading State
              </p>
              <p className="text-sm font-mono text-gray-700 bg-gray-50 p-3 rounded">
                {`<div className="p-6">
  {loading ? (
    <PremiumLoader size="md" text="Loading data..." />
  ) : (
    <DataContent />
  )}
</div>`}
              </p>
            </div>

            <div className="bg-white rounded p-4">
              <p className="text-sm font-semibold text-gray-900 mb-2">
                Text with Dots
              </p>
              <p className="text-sm font-mono text-gray-700 bg-gray-50 p-3 rounded">
                {`<p className="flex items-center gap-2">
  Loading vehicles <DotsLoader />
</p>`}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
