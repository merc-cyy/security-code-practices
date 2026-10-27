"use client";

import styles from "./page.module.css";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { AiOutlineHome } from "react-icons/ai";
import { useRouter } from "next/navigation";
import { StrikeThroughMaybe } from "@/lib/components/StrikeThroughMaybe";

export default function Home() {
    const searchParams = useSearchParams();

    const [tasks, setTasks] = useState([]);
    const [requestMade, setRequestMade] = useState(false);
    const router = useRouter();

    // Load the user ID
    let userID;
    try {
        userID = window.localStorage.getItem("userID");
    } catch (e) {
        // Do nothing
    }

    // Extract search term from the URL params; default is empty string
    const searchTerm = searchParams.get("search_query") ?? "";

    // Search for tasks stored against the user ID in the database
    const searchTasks = async () => {
	    let matchingTasks = [];
	    try {
            matchingTasks = await fetch(`/api/search?user_id=${userID}&search_query=${searchTerm}`)
                .then((res) => res.json())
	    } catch (error) {
            matchingTasks = [];
            console.error(error);
        }

        if (matchingTasks.constructor != Array) {
            matchingTasks = [];
        }

        // Place matchingTasks into the "tasks" variable (line 13)
        setTasks(matchingTasks);
        setRequestMade(true);
    };

    // Change whether a task has been completed or not
    // based on whether the box is checked
    const toggleTask = async (event, taskID) => {
        fetch(`/api/task?task_id=${taskID}&completed=${event.target.checked}`)
            .then((res) => res.json())
            .then(() => {
                searchTasks();
            });
    }

    // Redirect to the /home page
    const redirectToHome = async (event) => {
        event.preventDefault();
        router.push(`/home`);
    }

    // This hook executes when the page is loaded. When the page loads,
    // it needs to know the lists for the user to display them on the page.
    // Everything populated as a result of this function can be used
    // while rendering the DOM as below.
    useEffect(() => {
        searchTasks();
    }, []);

    // The following function returns the HTML that will 
    // be rendered before being displayed in the browser.

    // Comments below are enclosed within "{/* */}" blocks
    return (
        <main>

            {/* Display what the user has searched for */}
            {requestMade &&
                <div className={styles["search-header"]}>
                    <div className={styles["search-header-item"]}><button onClick={redirectToHome}><AiOutlineHome size={25} /></button></div>
                    <div className={styles["search-header-item"]} dangerouslySetInnerHTML={{ __html: `You have ${tasks.length} task(s) that contain \"${searchTerm}\"` }}></div>
                </div>
            }

            <br></br>

            {/* Display an unordered list (UL)
                containing the matching tasks
                for the user, against the search term */}
            <ul className={styles["todo-list"]}>
                {/* The tasks inside the UL need to be populated based on the 
                    what's in "tasks". For each task, we look at its 5 fields from the DB below */}
                {tasks.map(({ task_id, taskname, completed, priority, deadline }) => {
                    return <li className={styles["li"]} key={task_id}>

                        {/* If task_id's task has been marked completed, strikethrough the task details */}
                        <StrikeThroughMaybe add={completed}>
                            <table><tbody>
                                <td>

                                    {/* If task_id's task has been marked completed, keep the box checked */}
                                    <input className={styles["form-check-input"]} type="checkbox" onChange={e => toggleTask(e, task_id)} checked={completed} />
                                </td>
                                <td>

                                    {/* The dangerouslySetInnerHTML attribute inside <span> tags
                                        ensure that any valid HTML in its value is rendered.
                                        (Equivalent to setting "spanElement.innerHTML = <something>;" in JavaScript) */}
                                    <tr>
                                        <th>Deadline:</th>
                                        <td><span dangerouslySetInnerHTML={{ __html: deadline }}></span></td>
                                    </tr>
                                    <tr>
                                        <th>Priority:</th>
                                        <td><span dangerouslySetInnerHTML={{ __html: priority }}></span></td>
                                    </tr>
                                    <tr>
                                        <th>TODO:</th>
                                        <td><span className="todo-text" dangerouslySetInnerHTML={{ __html: taskname }}></span></td>
                                    </tr>
                                </td>
                            </tbody></table>
                        </StrikeThroughMaybe>
                    </li>
                })}
            </ul>
        </main>
    )
}