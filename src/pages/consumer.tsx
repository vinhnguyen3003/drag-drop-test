import { IConfigItem } from '../@types'
import { BTN_TYPE_KEY, LOCAL_STORAGE_KEY } from '../constants'

function Consumer() {
  const jsonData = localStorage.getItem(LOCAL_STORAGE_KEY)
  const data:Array<IConfigItem> = jsonData ? JSON.parse(jsonData) : []

  const renderContent = () => {
		return data.map((da, index) => {
			const {type, props} = da
			if(type === BTN_TYPE_KEY) {
				return <button 
					key={index}
					onClick={() => alert(props.message)}
				>
					{props.text}
				</button>
			} else {
				return <div key={index}>
					{props.text}
				</div>
			}	
		})
  }

  return (
    <div className='container'>
		<div className='consumer-box'>
        {renderContent()}
		</div>
    </div>
  )
}

export default Consumer
