import useLocalStorage from '../hooks/useLocalStorage'

function Feedback() {
  const [feedbacks, setFeedbacks] = useLocalStorage('feedback', [])

  function onSubmit(e) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const entry = {
      id: String(Date.now()),
      name: form.get('name') || 'Anonymous',
      message: form.get('message') || '',
    }
    setFeedbacks([...feedbacks, entry])
    e.currentTarget.reset()
    alert('Thanks for your feedback!')
  }

  return (
    <div className="content">
      <h1>Feedback</h1>
      <form onSubmit={onSubmit} style={{display:'grid',gap:8,maxWidth:480}}>
        <input name="name" placeholder="Your name" />
        <textarea name="message" placeholder="Your feedback" rows={4} />
        <button className="add" type="submit">Submit</button>
      </form>
      <h2 className="section-title" style={{marginTop:16}}>Recent</h2>
      <ul>
        {feedbacks.map(f => (
          <li key={f.id}><strong>{f.name}:</strong> {f.message}</li>
        ))}
      </ul>
    </div>
  )
}

export default Feedback





