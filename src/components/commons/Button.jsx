const Button = ({className, children, ...props}) => {
    return (
        <button className={"p-2 bg-white text-gray-800 shadow-xl rounded-md hover:bg-gray-400 hover:text-white hover:shadow-2xl   " + className} {...props} >{children}</button>
    )
}

export default Button;