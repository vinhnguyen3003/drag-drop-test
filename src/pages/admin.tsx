import { useState } from 'react'
import { BTN_TYPE_KEY, LOCAL_STORAGE_KEY, PARAGRAPH_TYPE_KEY, TEXT_BTN_DEFAULT, TEXT_DEFAULT } from '../constants'


export interface IConfigItem {
    id: string,
    type: string,
    props: {
        text: string,
        message: string
    }
}

function Admin() {
    const [configs, setConfigs] = useState<Array<IConfigItem>>([])
    const [draggingEl, setDraggingEl] = useState<string>('')
    const [focusEl, setFocusEl] = useState<string>('')
    const [isSaved, setIsSaved] = useState<boolean>(false)
    const [isImport, setIsImport] = useState<boolean>(false)

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
                    text: type === BTN_TYPE_KEY ? TEXT_BTN_DEFAULT : TEXT_DEFAULT,
                    message: TEXT_DEFAULT
                }
            }
        ]))
        setDraggingEl('')
    }

    const handleFocus = (id: string) => {
        setFocusEl(id)
    }

    const handleBlur = (e: React.FocusEvent<HTMLDivElement | HTMLSpanElement>, key: string, id: string) => {
        const findConfigValue = configs.find(config => config.id === id)?.props

        const currValue = e.target?.innerText

        if(findConfigValue?.[key].toString() !== currValue) {
            setIsSaved(false)
        }

        if(!currValue) {
            console.log(e.target);
            e.target.innerHTML = TEXT_DEFAULT
        }

        const newConfigs = [...configs].map(config => config.id !== id ? config : {
            ...config,
            props: {
                ...config.props,
                [key]: currValue
            }
        })
        console.log(newConfigs);
        setConfigs(newConfigs);
    }

    const handleSave = () => {
        setIsSaved(true)
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(configs))
    }

    const handleExport = () => {
        const jsonStr = configs?.length ? JSON.stringify(configs) : null
        if(!jsonStr) return

        const filename = 'data.json';

        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(jsonStr));
        element.setAttribute('download', filename);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }


    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files?.length) return

        const file = files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            const jsonData = e.target?.result?.toString() || ''
            if(jsonData) {
                setConfigs(JSON.parse(jsonData))
                setIsImport(false)
                handleSave()
            } else {
                alert('Import Fail')
            }
        };
        reader.readAsText(file);
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
                        dangerouslySetInnerHTML={{__html: props.text}}
                    />
                    <div className='alert-box'>
                        <span>Alert:</span>
                        <span
                            contentEditable={true} 
                            suppressContentEditableWarning={true}
                            onFocus={() => handleFocus(id)}
                            onBlur={(e) => handleBlur(e, 'message', id)}
                            dangerouslySetInnerHTML={{__html: props.message}}
                        />
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
                    dangerouslySetInnerHTML={{__html: props.text}}
                />
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
            <button 
                disabled={!isSaved}
                onClick={handleExport}
            >
                Export
            </button>
            <button 
                onClick={() => setIsImport(!isImport)}
            >
                Import
            </button>
            <button 
                disabled={!isSaved}
            >
                View
            </button>
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
            {
                isImport ?
                <div className='admin-body__right'>
                    <div className='upload-box'>
                        <input type='file' onChange={handleImport} />
                    </div>
                </div> :
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
            }
       </div>
    </div>
  )
}

export default Admin
