// *********************
// Role of the component: Simple H2 heading component
// Name of the component: Heading.tsx
// Developer: Aleksandar Kuzmanovic
// Version: 1.0
// Component call: <Heading title={title} />
// Input parameters: { title: string }
// Output: h2 heading title with some styles 
// *********************

import React from 'react'

const Heading = ({ title } : { title: string }) => {
  return (
    <h2 className="mt-20 text-center font-serif text-7xl font-bold uppercase tracking-wide text-stone-900 max-lg:text-5xl">{ title }</h2>
  )
}

export default Heading
