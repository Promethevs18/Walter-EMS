import React from 'react'

const Spinner = () => {
  return (
    <div className="spinner-border text-primary mt-5 spinner center color-black" role="status">
      <span className='visually-hidden'>
        Loading...
      </span>

    </div>
  )
}

export default Spinner