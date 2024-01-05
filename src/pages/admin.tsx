import { useState } from 'react'
import { useId } from 'react'
import { LOCAL_STORAGE_KEY } from '../constants'


interface IConfigItem {
    id: string,
    type: string,
    props: {
        text: string,
        message?: string
    }
}

const BTN_TYPE_KEY = 'Button'
const PARAGRAPH_TYPE_KEY = 'Paragraph'
const TEXT_BTN_DEFAULT = 'Button'
const TEXT_DEFAULT = 'Input something'

function Admin() {
    const [configs, setConfigs] = useState<Array<IConfigItem>>([])
    const [draggingEl, setDraggingEl] = useState<string>('')
    const [focusEl, setFocusEl] = useState<string>('')
    const [isSaved, setIsSaved] = useState<boolean>(false)
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, type: string) => {
        setDraggingEl(type)
        e.dataTransfer.setData("type", type);
    }

    const handleDropOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        const type = e.dataTransfer.getData("type");
        setConfigs(prev => ([
            ...prev,
            {
                id: Date.now().toString(),
                type,
                props: {
                    text: '',
                    message: ''
                }
            }
        ]))
        setDraggingEl('')
    }

    const handleFocus = (id: string) => {
        setFocusEl(id)
    }

    const handleBlur = (e: React.FocusEvent<HTMLDivElement>, key: string, id: string) => {
        const newConfigs = [...configs].map(config => config.id !== id ? config : {
            ...config,
            props: {
                ...config.props,
                [key]: e.target?.innerText
            }
        })
        setConfigs(newConfigs);
    }

    const handleSave = () => {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(configs))
    }

    const renderConfig = () => {
        return configs.map((config, index) => {
            const {id, type, props} = config
            if(type === BTN_TYPE_KEY) {
                return <div className='btn-config' key={index}>
                    <div 
                        className='btn' 
                        contentEditable={true} 
                        suppressContentEditableWarning={true}
                        onFocus={() => handleFocus(id)}
                        onBlur={(e) => handleBlur(e, 'text', id)}
                    >
                        {props.text || TEXT_BTN_DEFAULT}
                    </div>
                    <div className='alert-box'>
                        <span>Alert:</span>
                        <span
                            contentEditable={true} 
                            suppressContentEditableWarning={true}
                            onFocus={() => handleFocus(id)}
                            onBlur={(e) => handleBlur(e, 'message', id)}
                        >
                            {props.message || TEXT_DEFAULT}
                        </span>
                    </div>
                </div>
            } 
            else if(type === PARAGRAPH_TYPE_KEY) {
                return <div 
                    key={index}
                    contentEditable={true} 
                    suppressContentEditableWarning={true}
                    onFocus={() => handleFocus(id)}
                    onBlur={(e) => handleBlur(e, 'text', id)}
                >
                    {props.text || TEXT_DEFAULT}
                </div>
            }
        })
    }

  return (
    <div className='container'>
       <div className='admin-header'>
            <button 
                disabled={configs?.length === 0}
                onClick={handleSave}
            >
                Save
            </button>
            <button>Undo</button>
            <button>Redo</button>
            <button>Export</button>
            <button>Import</button>
            <button>View</button>
       </div>
       <div className='admin-body'>
            <div className='admin-body__left'>
                <div 
                    className='tool-item' 
                    draggable={true} 
                    onDragStart={(e) => handleDragStart(e, PARAGRAPH_TYPE_KEY)}
                >
                    <div />
                    <span>Paragraph</span>
                </div>
                <div 
                    className='tool-item' 
                    draggable={true} 
                    onDragStart={(e) => handleDragStart(e, BTN_TYPE_KEY)}
                >
                    <div />
                    <span>Button</span>
                </div>
            </div>
            <div className='admin-body__right'>
                <div 
                    className='body-right-config' 
                    onDragOver={handleDropOver} 
                    onDrop={handleDrop}
                >
                    {configs?.length ? renderConfig() : null}
                </div>
                <div className='body-right-info'>
                    <div className='info-item'>
                        <span>Dragging:</span>
                        <span>{draggingEl ? `${draggingEl} Element` : ''}</span>
                    </div>
                    <div className='info-item'>
                        <span>Instances:</span>
                        <span>{configs?.length}</span>
                    </div>
                    <div className='info-item'>
                        <span>Config Json:</span>
                        <span>
                            {JSON.stringify(configs?.find(config => config.id === focusEl) || '')}
                        </span>
                    </div>
                </div>
            </div>
       </div>
    </div>
  )
}

export default Admin
