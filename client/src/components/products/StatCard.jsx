import './StatCard.css'
function StatCard({ stat }) {
  return (
     <div>
      <div>{stat.icon}</div>

      <div>
        <p>{stat.title}</p>
        <h2>{stat.value}</h2>
        <p>{stat.change}</p>
        <p>{stat.description}</p>
      </div>
    </div>
  )
}
export default StatCard
