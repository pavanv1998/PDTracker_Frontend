const Text = ({className, props, children}) => {
    return (
        <div className={"font-mono " + className} {...props}>{children}</div>
    )
}

export default Text;