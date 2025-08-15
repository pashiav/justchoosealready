'use client'

import { Wheel } from '@/components/wheel'
import { FiltersPanel } from '@/components/filters-panel'
import { OptionList } from '@/components/option-list'

export default function SpinPage() {

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-1">

        <div className="grid lg:grid-cols-3 gap-8 w-full pr-0 lg:pr-12">
          {/* Filters Panel */}
          <div className="lg:col-span-1">
            <FiltersPanel />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Wheel */}
            <div className="rounded-2xl p-8">
              <Wheel />
            </div>

            {/* Options List */}
            <div className="rounded-2xl">
              <OptionList />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
